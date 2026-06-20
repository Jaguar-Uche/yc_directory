import { formateDate } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import { PLAYLIST_BY_SLUG_EXCLUDING_ID_QUERY, STARTUP_BY_ID_QUERY } from "@/sanity/lib/queries";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import markdownIt from 'markdown-it'
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import slugify from "slugify"

const md = markdownIt()

const page = async ({params} : {params: Promise<{id:string}>}) => {
    const id = (await params).id;

    const post = await client.fetch(STARTUP_BY_ID_QUERY, {id});
    const slug = slugify(post?.category as string, {lower: true, strict: true});
    const playlist = await client.fetch(PLAYLIST_BY_SLUG_EXCLUDING_ID_QUERY, {slug, id})

    const editorPosts = playlist?.select || [];

    // console.log(editorPosts)

    if(!post) return notFound();

    const parsedContent = md.render(post?.pitch || '');
return (
    <>
    <section className="pink_container !min-h-[230px]">
        <p className="tag">
            {formateDate(post?._createdAt)}
        </p>
        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl"> {post.description} </p>
    </section>

    <section className="section_container">
        <img src={post.image} alt="Thumbnail" className="w-full h-auto rounded-xl" />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
            <div className="flex-between gap-5">
                <Link href={`/user/${post.author?._id}`} className="flex gap-2 items-center mb-3" >
                    <Image src={post.author.image} alt="avatar" width={64} height={64} className="rounded-full drop-shadow-lg" />

                    <div>
                        <p className="text-20-medium"> {post.author.name} </p>
                        <p className="text-16-medium !text-black-300"> {post.author.username} </p>
                    </div>

                </Link>
                <p className="category-tag"> {post.category} </p>
            </div>
            <h3 className="text-30-bold">Pitch Details</h3>
            {/* We need to parse, and convert markdown to string */}
            {parsedContent ? 
            (<article
                //  React usually prevents html to prevent xxs attacks 
                className="prose max-w-4xl font-work-sans break-all"
                dangerouslySetInnerHTML = {{__html: parsedContent}} />
            ) 
            :
            (
                <p className="no-result">No details provided</p>
            )}
        </div>
        <hr className="divider"/>

        {/* TODO : Editor Selected Startups ie Recommend startups since u checked this out */}

        {
            editorPosts?.length > 0 && (
                <div className="max-w-4xl mx-auto">
                    <p className="text-30-semibold"> Other {post.category} startups </p>
                    <ul className="mt-7 card_grid-sm">
                        {editorPosts.map((startup : StartupTypeCard, index:number) => (
                            startup && <StartupCard key={index} post={startup} />
                        ) )}
                    </ul>
                </div>
            )
        }

        {/* this is the dynamic content in a static page */}
        <Suspense fallback={<Skeleton className="view_skeleton" />}>
            <View id={id} />
            {/* Shows the number of views of a pitch */}
        </Suspense>
    </section>
    
    </>
)
}

// Partial Prerendering

export default page