import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";
import { categoryMockup } from "../../../src/mockup";
import { useRouter } from "next/router";
import { useState, useRef } from "react";
import Link from "next/link";

import toast from "react-hot-toast";
import { firestore } from "@/lib/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import SettingIcon from "@material-ui/icons/Settings";
import { IconButton } from "@material-ui/core";

export default function MaintainRoom() {
  const router = useRouter();
  const [addWindow, setAddWindow] = useState(false);
  // const data = categoryMockup();

  return (
    <div className="body-container">
      <Navbar />
      <div className="section">
        {addWindow ? <AddDevice setAddWindow={setAddWindow} /> : null}
        <SideNav />
        <div className="content-container">
          <div className="information-container">
            <h1>
              Maintain {">"} Room {">"} {router.query.room}
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
            <MaintainDetailTable />
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintainDetailTable() {
  const router = useRouter();
  const [target, setTarget] = useState(null);
  const [float, setFloat] = useState(null);
  const [index, setIndex] = useState(null);
  const ref = firestore.collection("rooms").doc("518");
  const query = ref;
  const [querySnapshot] = useCollection(query);
  return (
    <>
      {float && (
        <FloatContent
          doc={float}
          snapshot={querySnapshot}
          setFloat={setFloat}
          index={index}
        />
      )}
      {target && <MaintainReport target={target} setTarget={setTarget} />}
      <div className="table">
        <div className="row head">
          {/* <div>id</div> */}
          <div>Name</div>
          <div>ServiceReport</div>
          <div></div>
        </div>
        {querySnapshot?.data().device?.map((doc, idx) => (
          <div className="row" key={doc.id}>
            <div>{doc}</div>
            <div>
              <IconButton onClick={() => setTarget(doc)}>
                <SettingIcon />
              </IconButton>
            </div>
            <div>
              <button
                onClick={function () {
                  setFloat(doc);
                  setIndex(idx);
                }}
              >
                detail
              </button>
              <button>edit</button>
              <button
                onClick={() =>
                  confirm("Are you sure you want to delete")
                    ? toast.error("delete device not allow for now")
                    : null
                }
              >
                delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function FloatContent({ doc, setFloat, snapshot, index }) {
  console.log(index);
  return (
    <div className="float-content">
      <div className="container">
        <div>
          <h2>{doc.split(":")[0]}</h2>
          <ul>
            <li>
              <b>ยี่ห้อ</b>: {doc.split(":")[1]}
            </li>
            <li>
              <b>รุ่น</b>: {doc.split(":")[2]}
            </li>
            <li>
              <b>จำนวน</b>: 1 หน่วย
            </li>
            <li>
              <b>อายุการใช้งานโดยประมาณ</b>:{" "}
              {snapshot.data().serviceLife[index]} ชั่วโมง
            </li>
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

function MaintainReport({ target, setTarget }) {
  const categoryRef = useRef(null);
  const nameRef = useRef(null);
  const problemRef = useRef(null);

  function formHandle(event) {
    event.preventDefault();
    // toast.success(`
    // Problem Sent to support
    // Device : ${categoryRef.current.value}
    // Device Detail : ${nameRef.current.value}
    // Problem : ${problemRef.current.value}
    // `);
    toast.success(`Problem Sent to support`);
    setTarget(null);
  }

  return (
    <form className="float-content" onSubmit={formHandle}>
      <div className="container">
        <div>
          <h1>Maintain Form</h1>
          <ul className="row">
            <li>
              <span>Device :</span>
              <input
                type="text"
                value={target.split(":")[0]}
                ref={categoryRef}
                disabled
              />
            </li>
            <li>
              <span>Device Detail</span>
              <input
                type="text"
                value={`${target.split(":")[1]} ${target.split(":")[2]}`}
                placeholder="Name..."
                ref={nameRef}
              />
            </li>
            <li>
              <span>Problem Details</span>
              <textarea cols="30" rows="10" ref={problemRef}></textarea>
            </li>
          </ul>
        </div>
        <div className="btn-group">
          <button
            onClick={() => {
              setTarget(null);
            }}
          >
            Cancle
          </button>
          <button type="submit">Ok</button>
        </div>
      </div>
    </form>
  );
}

function AddDevice({ setAddWindow }) {
  const router = useRouter();
  function formSubmitHandle(event) {
    event.preventDefault();
    toast.success("add device success");
    setAddWindow(false);
  }

  return (
    <form className="float-content" onSubmit={formSubmitHandle}>
      <div className="container">
        <div>
          <h1>Add device Room {router.query.slug}</h1>
          <ul className="row">
            <li>
              <span>รหัสอุปกรณ์:</span>
              <input type="text" />
            </li>
            <li>
              <span>ชื่ออุปกรณ์:</span>
              <input type="text" />
            </li>
            <li>
              <span>ห้อง:</span>
              <input type="text" value={router.query.slug} />
            </li>
            <li>
              <span>ที่อยู่:</span>
              <input type="text" />
            </li>
            <li>
              <span>จำนวน:</span>
              <input type="text" />
            </li>
            <li>
              <span>รายละเอียด:</span>
              <input type="text" />
            </li>
            <li>
              <span>กำลังไฟฟ้าสุทธิ:</span>
              <input type="text" />
            </li>
            <li>
              <span>หมวดหมู่:</span>
              <input type="text" />
            </li>
            <li>
              <span>อายุการใช้งาน(ชั่วโมง):</span>
              <input type="text" />
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
      </div>
    </form>
  );
}
