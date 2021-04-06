import "../styles/globals.scss";
import { UserContext } from "@/lib/context";
import { useUserData } from "@/lib/hook";
import { Toaster } from "react-hot-toast";

import Login from "./login";
import Loading from "@/components/Loading";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const userData = useUserData();
  const { user, loading } = userData;

  if (!user) return <Login />;
  if (loading) return <Loading />;

  return (
    <>
      <Head>
        <title>Predictive Mantenance</title>
      </Head>
      <UserContext.Provider value={userData}>
        <Component {...pageProps} />
        <Toaster />
      </UserContext.Provider>
    </>
  );
}

export default MyApp;
