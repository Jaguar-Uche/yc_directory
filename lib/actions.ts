'use server'

import { auth } from "@/auth"
import { parseServerActionResponse } from "./utils";
import slugify from "slugify";
import { writeClient } from "@/sanity/lib/write-client";
import { PLAYLIST_BY_SLUG_QUERY } from "@/sanity/lib/queries";

// Creates a new playlist document for a given category slug, seeded with one startup
const createPlaylist = async (categoryTitle: string, categorySlug: string, startupId: string) => {
    return writeClient.create({
        _type: 'playlist',
        title: categoryTitle,
        slug: {
            _type: 'slug',
            current: categorySlug,
        },
        select: [
            {
                _key: startupId, // reusing startupId as the array item key keeps it unique & stable
                _type: 'reference',
                _ref: startupId,
            },
        ],
    });
}

// Appends a startup reference to an existing playlist's `select` array
const addStartupToPlaylist = async (playlistId: string, startupId: string) => {
    return writeClient
        .patch(playlistId)
        .setIfMissing({ select: [] })
        .insert('after', 'select[-1]', [
            {
                _key: startupId,
                _type: 'reference',
                _ref: startupId,
            },
        ])
        .commit();
}

// Orchestrator: find-or-create the category playlist, then attach the startup
const addStartupToCategoryPlaylist = async (category: string, startupId: string) => {
    const categorySlug = slugify(category, { lower: true, strict: true });

    try {
        const existingPlaylist = await writeClient.fetch(PLAYLIST_BY_SLUG_QUERY, { slug: categorySlug });

        if (existingPlaylist?._id) {
            await addStartupToPlaylist(existingPlaylist._id, startupId);
        } else {
            await createPlaylist(category, categorySlug, startupId);
        }
    } catch (error) {
        // Don't fail the whole pitch creation if playlist linking fails — just log it
        console.log('Failed to add startup to playlist:', error);
    }
}

export const createPitch = async (state: any, form : FormData, pitch:string)=>{
    const session = await auth();
    if(!session) return parseServerActionResponse({error: 'Not Signed in', status:"Error"});

    const {title, description, category, link} = Object.fromEntries(
        Array.from(form).filter(([key]) => key != 'pitch')
    )

    const slug = slugify(title as string, {lower: true, strict: true});

    try{
        const startup = {
            title, 
            description, 
            category, 
            image:link,
            slug: {
                _type : 'slug', 
                current: slug,
            },
            author:{
                _type :'reference',
                _ref:session?.id,
            },
            pitch
        }

        const result = await writeClient.create({_type: "startup", ...startup});

        // Add the new startup to the playlist matching its category
        await addStartupToCategoryPlaylist(category as string, result._id);

        return parseServerActionResponse(
            {
                ...result,
                error:'',
                status : 'SUCCESS'
            }
        )
    }catch(error){      
        console.log(error)
        return parseServerActionResponse({error: JSON.stringify(error), status : 'ERROR'})
    }
}