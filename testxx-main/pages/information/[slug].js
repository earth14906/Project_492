import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";
import { data } from "../../src/mockup";
import { useCollection } from "react-firebase-hooks/firestore";
import { firestore, serverTimestamp } from "@/lib/firebase";
import toast from "react-hot-toast";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import DescriptionIcon from "@material-ui/icons/Description";

export default function RoomInformation() {
  const router = useRouter();
  const filterData = data().filter((doc) => doc.room === router.query.slug);
  const [addWindow, setAddWindow] = useState(false);
  return (
    <div className="body-container">
      <Navbar />
      <div className="section">
        <SideNav />
        {addWindow ? <AddDevice setAddWindow={setAddWindow} /> : null}
        <div className="content-container">
          <div className="information-container">
            <h1>
              Information {">"} Room {">"} {router.query.slug}
            </h1>
            <div className="information-content-header">
              <button
                onClick={() => {
                  setAddWindow(true);
                }}
              >
                Add
              </button>
            </div>
            <InformationDetailTable data={filterData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InformationDetailTable({ data }) {
  const [float, setFloat] = useState(null);
  const [edit, setEdit] = useState(null);

  return (
    <>
      {float && <FloatContent float={float} setFloat={setFloat} />}
      {edit && <EditContent data={edit} setEdit={setEdit} />}
      <div className="table">
        <div className="row head">
          {/* <div>id</div> */}
          <div>name</div>
          <div>status</div>
          <div>controll</div>
        </div>
        {data.map((doc) => (
          <div className="row" key={doc.id}>
            {/* <div>{doc.id}</div> */}
            <div>{doc.name}</div>
            <div>{doc.status}</div>
            <div>
              <DescriptionIcon onClick={() => setFloat(doc)} />
              <EditIcon onClick={() => setEdit(doc)} />
              <DeleteIcon onClick={() => deleteData(doc.room)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AddDevice({ setAddWindow }) {
  const router = useRouter();
  const [data, setData] = useState([]);
  useEffect(() => {
    firestore
      .collection("room")
      .where("room", "==", router.query.slug)
      .get()
      .then((snapshot) => {
        // console.log(snapshot.docs[0].data());
        setData(snapshot.docs[0].data());
      });
  }, []);

  const ref = firestore.collection("category");
  const query = ref.orderBy("name");
  const [querySnapshot] = useCollection(query);
  const type = querySnapshot?.docs.map((doc) => doc.data());

  const formSubmitHandle = async (event) => {
    event.preventDefault();
    let ID;
    firestore
      .collection("room")
      .where("room", "==", router.query.slug)
      .onSnapshot((res) => (ID = res.docs[0].id));

    const ref = firestore.collection("room").doc(ID);
    // Tip: give all fields a default value here
    const data = {
      name,
      number,
      power,
      detail,
      time,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await ref.update(data);

    toast.success("add device success");
    // setAddWindow(false);
  };

  const [name, setName] = useState("");
  const [number, setNumber] = useState(1);
  const [detail, setDetail] = useState("");
  const [power, setPower] = useState(1);
  const [time, setTime] = useState(0);

  return (
    <form className="float-content" onSubmit={formSubmitHandle}>
      <div className="container">
        {data ? (
          <>
            <div>
              <h1>Add device Room {router.query.slug}</h1>
              <ul className="row">
                <li>
                  <span>ชื่ออุปกรณ์:</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </li>
                <li>
                  <span>ห้อง:</span>
                  <input type="text" value={data.room} disabled />
                </li>
                <li>
                  <span>ที่อยู่:</span>
                  <input type="text" value={data.location} disabled />
                </li>
                <li>
                  <span>จำนวน:</span>
                  <input
                    type="text"
                    required
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </li>
                <li>
                  <span>รายละเอียด:</span>
                  <input
                    type="text"
                    required
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                  />
                </li>
                <li>
                  <span>กำลังไฟฟ้าสุทธิ:</span>
                  <input
                    type="text"
                    required
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                  />
                </li>
                <li>
                  <span>หมวดหมู่:</span>
                  <select>
                    {type &&
                      type.map((doc) => (
                        <option value={doc.name}>{doc.name}</option>
                      ))}
                  </select>
                </li>
                <li>
                  <span>อายุการใช้งาน(ชั่วโมง):</span>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
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
              <button type="submit">add</button>
            </div>
          </>
        ) : (
          "Loading"
        )}
      </div>
    </form>
  );
}
