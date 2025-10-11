import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <div>
   
<div className="relative py-16 bg-gradient-to-br from-sky-50 to-gray-200">  
    <div className="relative container m-auto px-6 text-gray-500 md:px-12 xl:px-40">
        <div className="m-auto md:w-8/12 lg:w-6/12 xl:w-6/12">
            <div className="rounded-xl">
            <SignIn />
            </div>
        </div>
    </div>
</div>
    </div> 
}