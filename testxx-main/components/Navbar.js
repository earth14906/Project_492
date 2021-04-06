import { useContext } from "react";
import { UserContext } from "@/lib/context";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const { user, username } = useContext(UserContext);

  return (
    <nav className="nav-bar">
      <a href="/">
        <img src="logo.png" alt="logo" />
      </a>
      <div>
        <>
          <img src={user.photoURL} alt="profile-picture" />
          <span>{user.displayName}</span>
          <button onClick={() => auth.signOut()}>Sign Out</button>
        </>
        {!user && <SignInButton />}
      </div>
    </nav>
  );
}
