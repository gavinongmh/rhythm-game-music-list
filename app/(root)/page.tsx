import { auth } from "@/auth";

const Home = async () => {
  const session = await auth();
  console.log(session);
  return (
    <>
      <h1 className="text-3xl font-black text-light-500">Hello world!</h1>
    </>
  );
};

export default Home;
