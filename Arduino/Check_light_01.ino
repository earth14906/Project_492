// EmonLibrary examples openenergymonitor.org, Licence GNU GPL V3
#include <FirebaseESP8266.h>
#include <ESP8266WiFi.h>
#include <TridentTD_LineNotify.h>
#include "EmonLib.h"                   // Include Emon Library
#include <Wire.h>
#include <BH1750.h>
#include <time.h>

// Config Firebase
#define FIREBASE_HOST "maintenance-ff848-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "LNIfOxzRhqcuzITE2LwrmpfQnkGM4sWyE3oXpe5z"

// Config WiFi
#define WIFI_SSID "@JumboPlusIoT"
#define WIFI_PASSWORD "ilovecmu"
// Config Line
#define LINE_TOKEN  "pXbsHmGjYfx6ydZCoskldKtB3EiJuTebseXdgdgu6lk"




EnergyMonitor emon1;     // Create an instance
BH1750 lightMeter;
FirebaseData firebaseData;

float standard = 100;//เดี๋ยวไม่ได่นอน
float current_I = 0;
int count_blink = 0;
int state = 0;

// Config time
int timezone = 7;
char ntp_server1[20] = "ntp.ku.ac.th";
char ntp_server2[20] = "fw.eng.ku.ac.th";
char ntp_server3[20] = "time.uni.net.th";

int dst = 0;


unsigned long period = 900000; //ระยะเวลาที่ต้องการรอ
unsigned long last_time = 0; //ประกาศตัวแปรเป็น global เพื่อเก็บค่าไว้ไม่ให้ reset จากการวนloop
unsigned long lastUpdateEnergy = 0, lastUpdateFirebase = 0;
unsigned long Energy = 0;

void setup()
{  
  Serial.begin(9600);
  connectWifi();
 Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  emon1.current(A0, 111.1);             // Current: input pin, calibration.
   Wire.begin();
  // On esp8266 you can select SCL and SDA pins using Wire.begin(D4, D3);
  lightMeter.begin();
configTime(timezone * 3600, dst, ntp_server1, ntp_server2, ntp_server3);
  Serial.println("Waiting for time");
  while (!time(nullptr)) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.println("Now: " + getTime());
  Serial.println(F("BH1750 Test begin"));
   // กำหนด Line Token
  LINE.setToken(LINE_TOKEN);
}

void loop()
{    
  Check_light();
 
}

int CheckCurrent(){
  double Irms = emon1.calcIrms(1480);  // Calculate Irms only
  double Apparent_power = Irms*230.0;
      if(Apparent_power<50.0){
        Serial.print(" Apparent power: ");
      Serial.print(Apparent_power);         // Apparent power
      Serial.print(" W");
      Serial.print(" Irms: ");
      Serial.print(Irms);        // Irms
      Serial.print(" A ");
      Serial.println("สถานะ :ปิด ");
      return 0;
        }else{
      Serial.print(" Apparent power: ");
      Serial.print(Apparent_power);         // Apparent power
      Serial.print(" W");
      Serial.print(" Irms: ");
      Serial.print(Irms);        // Irms
      Serial.print(" A ");
      state = 1;
      Serial.println("สถานะ :เปิด ");
      return 1;
          }
  }
      
  void Check_light(){
     if ((millis() - lastUpdateEnergy) >= period) {
    lastUpdateEnergy = millis();

    unsigned long startTime = millis();

    Serial.print("Load time: ");
    Serial.print(millis() - startTime);
    Serial.println("ms");
    
    int CheckState_Current = CheckCurrent();
    int CheckState_light = 0;
    float lux = lightMeter.readLightLevel();
    double Irms = emon1.calcIrms(1480);
if(CheckState_Current != 0){
  
    if(lux<standard){
      
     CheckState_light = 0;
     count_blink++;
          
      if(count_blink > 1){
           line();
             String LineText;
             String string1 = "อุปกรณ์ทำงานผิดปกติ";
             String string2 = " lux";
             LineText = string1 + lux + string2;
             Serial.print("Line ");
             Serial.println(LineText);
             //LINE.notify(LineText);
           count_blink = 0;         
        }else{
          Serial.print("blink : ");
          Serial.println(count_blink);
          //CheckCurrent();
          }
}
      else{
        //กรณีความเข้มแสงทำงานปกติ
          CheckState_light = 1;
          Serial.print("Light: ");
          Serial.print(lux);
          Serial.println(" lx");
           
        }
     }else{
        CheckState_light = 1;
        Serial.print("ปิดไฟอยู่");
      }

     // Firebase
      FirebaseJson data;
      data.set("Current State ", CheckState_Current);
      data.set("Light State ", CheckState_light);
      data.set("Irms ", Irms);
      data.set("Light Intensity (lux)", lux);
      data.set("time ", getTime());

      
if(Firebase.pushJSON(firebaseData, "/lightMeter", data)) {
    Serial.println("Pushed : " + firebaseData.pushName()); 
} else {
    Serial.println("Error : " + firebaseData.errorReason());
      
    }
  }
}  

void line(){
     Serial.println(" แจ้งเตือน");
     delay(300);
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
  
