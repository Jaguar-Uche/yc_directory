import { cn, formateDate } from '@/lib/utils'
import { EyeIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { Author, Startup } from '@/sanity/types'
import { Skeleton } from './ui/skeleton'

export type StartupTypeCard = Omit<Startup, "author"> & {author?: Author}

const StartupCard = ({post}: {post : StartupTypeCard}) => {
    const {_createdAt, views, author, title, category, _id : id, image, description} = post
    
return (
    <li className='startup-card group'>
        <div className='flex-between'>
            <p className='startup_card_data'> {formateDate(_createdAt)} </p>
            <div className='flex gap-1.5'>
                <EyeIcon className='size-6 text-primary' />
                <span className='text-16-medium'> {views} </span>
            </div>
        </div>

        <div className='flex-between mt-5 gap-5'>
            <div className='flex-1'>
                <Link href={`/user/${post.author?._id}`}> 
                    <p className='text-16-medium line-clamp-1'> {author?.name} </p>
                </Link>
                <Link href={`/startup/${id}`} >
                    <h3 className='text-26-semibold line-clamp-1'> {title} </h3>
                </Link>
            </div>
            <Link href={`/user/${author?._id}`}>
                <Image src={author?.image!} alt={author?.name!} width={48} height={48} className='rounded-full' />
                {/* Nextjs wouldn't let us render the image, cause it doesn't know whether we can trust it, so we go to next.config.ts and tell nextjs we can */}
                {/* Image type of svg might not show cause dangerouslyallowsvg may be disabled */}
            </Link>
        </div>

        <Link href={`/startup/${id}`}>
            <p className='startup-card_desc'>
                {description}
            </p>

            <img src={image} alt="placeholder" className='startup-card_img' />
            {/* using nextjs image component uses up optimization calls if they are plenty, so try to minimize plenty plenty images */}

        </Link>

        <div className="flex-between gap-3 mt-5">
            <Link href={`/?query=${category?.toLowerCase()}`}>
                <p className='text-16-medium'> {category} </p>
            </Link>

            <Button className='startup-card_btn'>
                <Link href={`/startup/${id}`}>
                    Details
                </Link>
            </Button>
        </div>

    </li>
)
}

export const StartupCardSkeleton = () => (
    <>
    {[0].map((index:number) =>(
        <li key={cn('skeleton', index)}>
            <Skeleton className='startup-card_skeleton' />
        </li>
    ))}
    </>
)
    
export default StartupCard