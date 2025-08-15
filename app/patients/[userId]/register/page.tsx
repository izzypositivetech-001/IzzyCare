import { getUser } from '@/lib/actions/patient.actions'
import RegisterForm from '@/components/forms/RegisterForm'
import Image from 'next/image'


const Register = async ({ params }: { params: Promise<{ userId: string }> }) => {
    const { userId } = await params;
    const user = await getUser(userId);

  return (
   
     <div className="flex h-screen max-h-screen">
     <section className="remove-scrollbar container ">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <Image 
             src="/assets/icons/logo-full.svg"
             alt="patient"
             height={1000}
             width={1000}
             className="mb-12 h-10 w-fit"
          />
           <RegisterForm user={user} />

          <div className="text-14-regular mt-20 flex justify-between">
              <p className="copyrigt py-12">
               © 2025 IzzyCare
                </p>
              
          </div>
        </div>
     </section>

     <Image
       src="/assets/images/register-img.png"
       height={1000}
       width={1000}
       alt="patient"
       className="side-img max-w-[390px]"
     />
    </div>
  )
}

export default Register
