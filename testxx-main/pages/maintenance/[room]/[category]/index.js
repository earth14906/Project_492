import { useRouter } from "next/router";
import { data, categoryMockup } from "../../../../src/mockup";
import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";

export default function MaintainCategoryDetail() {
  const router = useRouter();
  const mockupData = data();
  const filterData = mockupData.filter(
    (doc) =>
      doc.category_id === router.query.category &&
      doc.room === router.query.room
  );

  const categoryName = () => {
    const name = categoryMockup();
    if (typeof router.query.category !== "undefined")
      return name.filter((doc) => doc.id == router.query.category)[0].category;
  };
  return (
    <div className="body-container">
      <Navbar />
      <div className="section">
        <SideNav />
        <div className="content-container">
          <div className="information-container">
            <h1>
              Maintain {">"} Room {">"} {router.query.room} {">"}{" "}
              {categoryName()}
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
            <MaintainDetailTable data={filterData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintainDetailTable({ data }) {
  return (
    <>
      <div className="table">
        <div className="row head">
          <div>id</div>
          <div>category</div>
          <div>ServiceReport</div>
          <div></div>
        </div>
        {data.map((doc) => (
          <div className="row" key={doc.id}>
            <div>{doc.id}</div>
            <div>{doc.category_name}</div>
            <div>
              <button onClick={() => setTarget(doc.category)}>ICON</button>
            </div>
            <div>
              <button>detail</button>
              <button>edit</button>
              <button>delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
