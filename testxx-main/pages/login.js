import { auth, googleAuthProvider } from "../lib/firebase";
import { useContext } from "react";
import { UserContext } from "../lib/context";

export default function Login() {
  const { user, username } = useContext(UserContext);

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />

  return (
    <main className="login-container">
      Login to system account
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>

    // <div>
    //   <h1>Perventive Maintenance System</h1>
    //   <h3>Login</h3>
    //   <form>
    //     <div>
    //       <label>Username</label>
    //       <input type="text" />
    //     </div>
    //     <div>
    //       <label>Password</label>
    //       <input type="text" />
    //     </div>
    //     <div>
    //       <button type="submit">Login</button>
    //     </div>
    //   </form>
    //   <h3>
    //     <a href="/signup">Or sign up</a>
    //   </h3>
    // </div>
  );
}
// Sign in with Google button
function SignInButton() {
  const signInWithGoogle = async () => {
    await auth.signInWithPopup(googleAuthProvider);
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={"/google.png"} /> <span>Sign in with Google</span>
    </button>
  );
}

// Sign out button
function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
  return <div>helo</div>;
}
