import { getUser } from '@/lib/actions/patient.actions'
import RegisterForm from '@/components/forms/RegisterForm'
import Image from 'next/image'

const Register = async ({ params }: { params: Promise<{ userId: string }> }) => {
  const { userId } = await params
  
  // Add proper error handling here
  let user = null;
  let error = null;
  
  try {
    const userDoc = await getUser(userId);
    
    if (userDoc) {
      user = {
        $id: userDoc.$id,
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        // add other User properties if needed
      };
    }
  } catch (err) {
    console.error("Failed to fetch user:", err);
    error = "Unable to load user data. Please try again.";
  }

  return (
    <div className="flex h-screen max-h-screen">
      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[860px] flex-1 flex-col py-10">
          <Image 
            src="/assets/icons/logo-full.svg"
            alt="patient"
            height={1000}
            width={1000}
            className="mb-12 h-10 w-fit"
          />
          
          {error ? (
            <div className="text-red-500 p-4 border border-red-300 rounded-md">
              {error}
              <br />
              <small>Check your environment variables in Vercel.</small>
            </div>
          ) : user ? (
            <RegisterForm user={user} />
          ) : (
            <div className="text-red-500">User not found.</div>
          )}

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