import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";
import { informationMockup } from "../../src/mockup";
import { firestore, serverTimestamp } from "@/lib/firebase";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import toast from "react-hot-toast";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import DescriptionIcon from "@material-ui/icons/Description";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Information() {
  const [addWindow, setAddWindow] = useState(false);
  return (
    <div className="body-container">
      <Navbar />
      <div className="section">
        <SideNav />
        {addWindow ? <AddRoom setAddWindow={setAddWindow} /> : null}
        <div className="content-container">
          <div className="information-container">
            <h1>Information</h1>
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
            <InformationTable />
          </div>
        </div>
      </div>
    </div>
  );
}

function InformationTable() {
  const [float, setFloat] = useState(null);
  const [edit, setEdit] = useState(null);
  const ref = firestore.collection("rooms");
  const query = ref.orderBy("location");
  const [querySnapshot] = useCollection(query);
  async function deleteData(room) {
    if (confirm("Are you sure")) {
      await firestore.collection("rooms").doc(room).delete();
      toast.success("Delete success");
    }
  }

  return (
    <>
      {float && <FloatContent float={float} setFloat={setFloat} />}
      {edit && <EditContent data={edit} setEdit={setEdit} />}
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
              <DescriptionIcon onClick={() => setFloat(doc)} />
              <EditIcon onClick={() => setEdit(doc)} />
              <DeleteIcon onClick={() => deleteData(doc.id)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function FloatContent({ float, setFloat }) {
  return (
    <div className="float-content">
      <div className="container">
        <div>
          <h2>{float.id}</h2>
          <ul>
            <li>ที่อยู่: {float.data().location}</li>
            {float.data().device?.map((doc, idx) => (
              <li key={idx}>
                <h4>
                  อุปกรณ์ {idx + 1}: {doc}
                </h4>
                <span>
                  Service life est: {float.data().serviceLife[idx]} Hours
                </span>
              </li>
            ))}

            {/* <li>ที่อยู่: {float.data().location}</li> */}
            {/* <li>รหัสอุปกรณ์:{float}</li>
            <li>ชื่ออุปกรณ์:102201</li>
            <li>ห้อง:516</li>
            <li>ที่อยู่:102201</li>
            <li>รหัสอุปกรณ์:102201</li> */}
          </ul>
        </div>
        <button
          onClick={() => {
            setFloat(null);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function EditContent({ data, setEdit }) {
  const [location, setLoction] = useState(data.location);
  // const [room, setRoom] = useState(data.room);
  function editData(event) {
    event.preventDefault();
    firestore.collection("rooms").doc(data.id).set(
      {
        location,
      },
      { merge: true }
    );
    toast.success("Update success");
    setEdit(null);
  }

  return (
    <div className="float-content">
      <form className="container" onSubmit={editData}>
        <div>
          <h2>Edit {data.room}</h2>
          <ul>
            <li>
              <span>ที่่อยู่</span>
              <input
                type="text"
                placeholder={data.data().location}
                onChange={(e) => setLoction(e.target.value)}
              />
            </li>
            {/* <li>
              <span>ห้อง</span>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </li> */}
            {/* <li>รหัสอุปกรณ์:{float}</li>
            <li>ชื่ออุปกรณ์:102201</li>
            <li>ห้อง:516</li>
            <li>ที่อยู่:102201</li>
            <li>รหัสอุปกรณ์:102201</li> */}
          </ul>
        </div>
        <button type="submit">Edit</button>
        <button
          onClick={() => {
            setEdit(null);
          }}
        >
          Close
        </button>
      </form>
    </div>
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
    const ref = firestore.collection("rooms").doc(room);

    // Tip: give all fields a default value here
    const data = {
      location,
    };

    await ref.set(data);

    toast.success("Room created!");

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
