import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";
import { firestore, serverTimestamp } from "@/lib/firebase";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import toast from "react-hot-toast";
import Link from "next/link";

import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import DescriptionIcon from "@material-ui/icons/Description";

export default function Maintenance() {
  const [addWindow, setAddWindow] = useState(false);
  return (
    <div className="body-container">
      <Navbar />
      <div className="section">
        <SideNav />
        {addWindow ? <AddRoom setAddWindow={setAddWindow} /> : null}
        <div className="content-container">
          <div className="information-container">
            <h1>Maintance</h1>
            <div className="information-content-header">
              <button
                className="copy"
                onClick={() => {
                  setAddWindow(true);
                }}
              >
                Add
              </button>
            </div>
            <MaintainTable />
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintainTable() {
  const router = useRouter();
  const [float, setFloat] = useState(null);
  const ref = firestore.collection("rooms");
  const query = ref.orderBy("location");
  const [querySnapshot] = useCollection(query);
  const data = querySnapshot?.docs.map((doc) => doc.data());
  return (
    <>
      {float && <FloatContent float={float} setFloat={setFloat} />}
      <div className="table">
        <div className="row head">
          {/* <div>id</div> */}
          <div>Room</div>
          <div>Location</div>
          <div></div>
        </div>
        {querySnapshot?.docs?.map((doc) => (
          <div className="row">
            {/* <div>{doc.id}</div> */}
            <div>
              <Link href={`/maintenance/${doc.id}`}>
                <a>{doc.id}</a>
              </Link>
            </div>
            <div>{doc?.data().location}</div>
            <div>
              <DescriptionIcon
                onClick={() => router.push(`/maintenance/${doc.id}`)}
              />
              <DeleteIcon onClick={() => deleteData(doc.id)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AddRoom({ setAddWindow }) {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const [location, setLocation] = useState("");

  // Ensure slug is URL safe
  // const slug = encodeURI(kebabCase(room));

  // Create a new post in firestore
  const createPost = async (e) => {
    e.preventDefault();
    const ref = firestore.collection("room").doc();

    // Tip: give all fields a default value here
    const data = {
      room,
      location,
      // slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await ref.set(data);

    toast.success("Post created!");

    // Imperative navigation after doc is set
    router.push(`/maintenance/${room}`);
  };

  return (
    <form className="float-content" onSubmit={createPost}>
      <div className="container">
        <div>
          <ul className="row">
            <li>
              <span>Room</span>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Room..."
              />
            </li>
            <li>
              <span>Location</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location..."
              />
            </li>
          </ul>
        </div>
        <div className="btn-group">
          <button
            onClick={() => {
              setAddWindow(false);
            }}
          >
            Close
          </button>
          <button>add</button>
        </div>
      </div>
    </form>
  );
}
