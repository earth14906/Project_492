import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";
import { useState, useEffect } from "react";
import { jsonData } from "@/src/readFile";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  LineSeries,
} from "react-vis";
import { firestore } from "@/lib/firebase";
import firebase from "firebase";
import TimeAgo from "timeago-react";

export default function DataAnalysis() {
  // const { ProjectorData, LightMeterData } = jsonData();

  const [selectValue, setSelectValue] = useState("Light");
  const [dataToPlot, setDatatoPlot] = useState([]);

  const [dataSnapshot, loading] = useCollection(
    firestore
      .collection("rooms")
      .doc("518")
      .collection(selectValue)
      // .limit(7)
      .orderBy("lastUpdate", "desc")
  );

  useEffect(() => {
    if (typeof dataSnapshot !== "undefinded") {
      const { timeMinutePerDay } = SetFile(dataSnapshot);
      setDatatoPlot(timeMinutePerDay);
      // console.log(dataSnapshot);
    }
  }, [dataSnapshot]);

  function graphPlotData() {
    const grapthPlot = dataToPlot.map(function (doc, index) {
      return { x: index + 1, y: dataToPlot[index] };
    });
    return grapthPlot;
  }

  return (
    <div className="body-container">
      <Navbar />
      <div className="section">
        <SideNav />
        <div className="content-container">
          <div className="information-container">
            <h1>Datanalysis 518</h1>
            <h4>{selectValue}</h4>
            <div>
              <XYPlot width={550} height={450}>
                <HorizontalGridLines />
                <LineSeries data={graphPlotData()} />
                {/* <LineSeries data={graphPlotData()} /> */}
                <XAxis title="Date" className="x-axis-override" />
                <YAxis title="Minuite" />
              </XYPlot>
            </div>
            <div className="graph-extend">
              <h2>{selectValue}</h2>
              <div className="graph-container">
                <div>
                  <p>
                    {selectValue} 1 :
                    {dataSnapshot?.docs[0]?.data().active ? "ON" : "OFF"}
                  </p>
                  <p>
                    <b>Updated </b>
                    {dataSnapshot?.docs[0]
                      ?.data()
                      .lastUpdate?.toDate()
                      .toDateString()}
                  </p>
                </div>
                <div>
                  <p>
                    Predictive service life remain:
                    <b>{predictDate(selectValue, dataToPlot)}</b> days.
                  </p>
                </div>
              </div>
              {/* {dataToPlot.map((doc, index) => (
                <p>
                  {doc > 0
                    ? `Date ${index + 1} : ${parseInt(doc)} minute`
                    : null}
                </p>
              ))} */}
            </div>
            <select onChange={(e) => setSelectValue(e.target.value)}>
              <option value="Light">Light</option>
              <option value="Projector">Projector</option>
              <option value="Air">Air</option>
            </select>
          </div>

          {/* <div>
            {dataSnapshot?.docs.map(function (doc) {
              // console.log(doc.data().lastUpdate?.toDate().toDateString());
              return (
                <>
                  <p>
                    {(firebase.firestore.Timestamp.now().toMillis() -
                      doc.data().lastUpdate?.toMillis()) /
                      1000 /
                      60}
                  </p>
                  <p>{doc.data().lastUpdate?.toDate().toDateString()}</p>
                  <p>{doc.data().lastUpdate?.toMillis()}</p>
                  <p>{doc.data().active ? "ON" : "OFF"}</p>
                  <TimeAgo datetime={doc.data().lastUpdate?.toDate()} />
                </>
              );
            })}
          </div> */}
        </div>
      </div>
    </div>
  );
}

function predictDate(selectValue, data) {
  const hoursToDays = 24;
  const date = data.length;
  const averageUseTime = data[data.length - 1] / date;
  const useTimeToHour = averageUseTime / 60;
  switch (selectValue) {
    case "Light":
      return parseInt((13000 - useTimeToHour) / hoursToDays);
    case "Projector":
      return parseInt((2000 - useTimeToHour) / hoursToDays);
    case "Air":
      return parseInt((1800 - useTimeToHour) / hoursToDays);
    default:
      return parseInt((13000 - useTimeToHour) / hoursToDays);
  }
}

function SetFile(data) {
  const dataLength = data?.size;
  let datePerMonth = 31;
  const timeCal = [];
  for (let i = 0; i < datePerMonth; i++) {
    timeCal.push(0);
  }
  if (dataLength > 0) {
    data.docs.forEach(function (doc, index) {
      const targetDate =
        parseInt(doc.data().lastUpdate.toDate().toDateString().split(" ")[2]) -
        1;
      if (!doc.data().active && index + 1 < dataLength) {
        if (data.docs[index + 1]?.data().active) {
          const timeToInsert =
            (doc.data().lastUpdate.toMillis() -
              data.docs[index + 1]?.data().lastUpdate.toMillis()) /
            1000 /
            60;
          timeCal[targetDate] += timeToInsert;
          const myTarget = `${doc.data().lastUpdate.toDate()} - ${data.docs[
            index + 1
          ]
            ?.data()
            .lastUpdate.toDate()} : ${timeToInsert} Mins`;
          console.log(myTarget);
        }
      }
      // console.log("currentData");

      // if (index + 1 < dataLength) {
      //   console.log("nextData");
      //   console.log(
      //     (doc.data().lastUpdate.toMillis() -
      //       data.docs[index + 1]?.data().lastUpdate.toMillis()) /
      //       1000 /
      //       60
      //   );
      // }
    });
  }
  const timeMinutePerDay = SumTime(timeCal);

  function SumTime(timeArray) {
    let total = 0;
    const filter = timeArray.map(function (time) {
      total += time;
      return total;
    });
    return filter;
  }

  return { timeMinutePerDay };
}

// function ProjectorDataToPlot(data) {
//   const filterOnState = data.filter((doc) => doc.State === 1);
//   let datePerMonth = 31;
//   const timeMinutePerDay = [];
//   for (let i = 0; i < datePerMonth; i++) {
//     timeMinutePerDay.push(0);
//   }
//   filterOnState.forEach(function (doc) {
//     const targetDate = doc.time.split(" ")[0].split("-")[2];
//     const date = parseInt(targetDate) - 1;
//     timeMinutePerDay[date] += 15;
//     return targetDate;
//   });
//   // console.log(timeMinutePerDay);
//   return { timeMinutePerDay };
// }

// function LightDataToPlot(data) {
//   const filterOnState = data.filter((doc) => doc["Light State"]);
//   // console.log(filterOnState);
//   let datePerMonth = 31;
//   const timeMinutePerDay = [];
//   for (let i = 0; i < datePerMonth; i++) {
//     timeMinutePerDay.push(0);
//   }
//   filterOnState.forEach(function (doc) {
//     const targetDate = doc.time.split(" ")[0].split("-")[2];
//     const date = parseInt(targetDate) - 1;
//     timeMinutePerDay[date] += 15;
//     return targetDate;
//   });
//   // console.log(timeMinutePerDay);
//   return { timeMinutePerDay };
// }
