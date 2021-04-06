#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <time.h>

#include "EmonLib.h"                   // Include Emon Library
EnergyMonitor emon1; 

// Config WiFi
#define WIFI_SSID "@JumboPlusIoT"
#define WIFI_PASSWORD "ilovecmu"

// Config Firebase
//#define FIREBASE_HOST "predictive-maintenance-project-default-rtdb.firebaseio.com/"
#define FIREBASE_HOST "maintenance-ff848-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "LNIfOxzRhqcuzITE2LwrmpfQnkGM4sWyE3oXpe5z"

FirebaseData firebaseData;
// Config time
int timezone = 7;
char ntp_server1[20] = "ntp.ku.ac.th";
char ntp_server2[20] = "fw.eng.ku.ac.th";
char ntp_server3[20] = "time.uni.net.th";



int dst = 0;

unsigned long period = 900000; //ระยะเวลาที่ต้องการรอ
unsigned long last_time = 0; //ประกาศตัวแปรเป็น global เพื่อเก็บค่าไว้ไม่ให้ reset จากการวนloop
int state = 0;
unsigned long lastUpdateEnergy = 0, lastUpdateFirebase = 0;
unsigned long Energy = 0;



void setup() {
  Serial.begin(115200);
  connectWifi();
  Serial.println();
  emon1.current(A0, 111.1);             // Current: input pin, calibration.
 
  configTime(timezone * 3600, dst, ntp_server1, ntp_server2, ntp_server3);
  Serial.println("Waiting for time");
  while (!time(nullptr)) {
    Serial.print(".");
    delay(200);
  }
  Serial.println();
  Serial.println("Now: " + getTime());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}


void loop() {
 CheckCurrent();   
}


void CheckCurrent(){
     if ((millis() - lastUpdateEnergy) >= period) {
    lastUpdateEnergy = millis();

    unsigned long startTime = millis();

    Serial.print("Load time: ");
    Serial.print(millis() - startTime);
    Serial.println("ms");
    
    double Irms = emon1.calcIrms(1480);  // Calculate Irms only
    double Apparent_power = Irms*230.0; // Apparent power
    if(Apparent_power>50){
    state = 1;    
      }else{
    state = 0;
    Serial.println(state);
        }

    

    //Firebase
    
      FirebaseJson data;

      data.set("Apparent power ", Apparent_power);
      data.set("Irms ", Irms);
      data.set("state", state);
      data.set("timestamp", getTime());


    if(Firebase.pushJSON(firebaseData, "/Air conditioner 1", data)) {
    Serial.println("Pushed : " + firebaseData.pushName()); 
      } else {
    Serial.println("Error : " + firebaseData.errorReason());
        }
      
    }
  

}
  
String getTime() {
  time_t now = time(nullptr);
  struct tm* newtime = localtime(&now);
  String tmpNow = "";
  tmpNow += String(newtime->tm_year + 1900);
  tmpNow += "-";
  tmpNow += String(newtime->tm_mon + 1);
  tmpNow += "-";
  tmpNow += String(newtime->tm_mday);
  tmpNow += " ";
  tmpNow += String(newtime->tm_hour);
  tmpNow += ":";
  tmpNow += String(newtime->tm_min);
  tmpNow += ":";
  tmpNow += String(newtime->tm_sec);
  return tmpNow;
}


void connectWifi() {
  // connect to wifi.
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("connecting");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("connected: ");
  Serial.println(WiFi.localIP());
  
    
}
