import data from "./predictive.json";

export function jsonData() {
  let { Projector, lightMeter } = data;
  let ProjectorData = [];
  let LightMeterData = [];
  for (var i in Projector) ProjectorData.push(Projector[i]);
  for (var i in lightMeter) LightMeterData.push(lightMeter[i]);

  return { ProjectorData, LightMeterData };
}
