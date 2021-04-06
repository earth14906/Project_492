import Link from "next/link";
import toaster from "react-hot-toast";

import OnlineInformationSVG from "../src/svg/OnlineInformationSVG";
import MaintenanceSVG from "../src/svg/MaintenanceSVG";
import DataAnalysisSVG from "../src/svg/DataAnalysisSVG";
import Logo from "../src/svg/LogoSVG";

export default function Home() {
  return (
    <div className="home">
      <div onClick={() => toaster.success("HI")}>
        <Logo />
      </div>
      <div className="menu-container">
        <Link href="/information">
          <div>
            <OnlineInformationSVG />
            <span>Information</span>
          </div>
        </Link>
        <Link href="/dataanalysis">
          <div>
            <DataAnalysisSVG />
            <span>Data analysis</span>
          </div>
        </Link>
        <Link href="/maintenance">
          <div>
            <MaintenanceSVG />
            <span>Maintenance</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
