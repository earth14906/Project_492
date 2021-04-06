#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <PZEM004Tv30.h>
#include <time.h>

// Config WiFi
#define WIFI_SSID "@JumboPlusIoT"
#define WIFI_PASSWORD "ilovecmu"

// Config Firebase
//#define FIREBASE_HOST "predictive-maintenance-project-default-rtdb.firebaseio.com/"
//#define FIREBASE_AUTH "3XKhTFaHlj4PKSyWe8my4h4qoHmjLmmOxatfe4jL"
#define FIREBASE_HOST "maintenance-ff848-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "LNIfOxzRhqcuzITE2LwrmpfQnkGM4sWyE3oXpe5z"


#ifndef min
#define min(a,b) ((a)<(b)?(a):(b))
#endif

FirebaseData firebaseData;
float calBill(float Unit, float ft, bool over_150_Unit_per_month = false) ;

// Config time
int timezone = 7;
char ntp_server1[20] = "ntp.ku.ac.th";
char ntp_server2[20] = "fw.eng.ku.ac.th";
char ntp_server3[20] = "time.uni.net.th";

int dst = 0;

int state = 0;
// Config bill
#define FIX_FT -15.90


unsigned long period = 900000; //ระยะเวลาที่ต้องการรอ
unsigned long last_time = 0; //ประกาศตัวแปรเป็น global เพื่อเก็บค่าไว้ไม่ให้ reset จากการวนloop
unsigned long lastUpdateEnergy = 0, lastUpdateFirebase = 0;
unsigned long Energy = 0;


PZEM004Tv30 pzem(5, 4);  // (RX,TX) connect to TX,RX of PZEM


void setup() {
  Serial.begin(115200);
  connectWifi();
  Serial.println();
 
  configTime(timezone * 3600, dst, ntp_server1, ntp_server2, ntp_server3);
  Serial.println("Waiting for time");
  while (!time(nullptr)) {
    Serial.print(".");
    delay(500);
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
    
     float voltage = pzem.voltage();
    if(voltage != NAN){
        Serial.print("Voltage: "); Serial.print(voltage); Serial.println("V");
    } else {
        Serial.println("Error reading voltage");
    }

    float current = pzem.current();
    if(current != NAN){
        Serial.print("Current: "); Serial.print(current); Serial.println("A");
    } else {
        Serial.println("Error reading current");
    }

    float power = pzem.power();
    if(current != NAN){
        Serial.print("Power: "); Serial.print(power); Serial.println("W");
    } else {
        Serial.println("Error reading power");
    }

    float energy = pzem.energy();
    if(current != NAN){
        Serial.print("Energy: "); Serial.print(energy,3); Serial.println("kWh");
    } else {
        Serial.println("Error reading energy");
    }

    float frequency = pzem.frequency();
    if(current != NAN){
        Serial.print("Frequency: "); Serial.print(frequency, 1); Serial.println("Hz");
    } else {
        Serial.println("Error reading frequency");
    }

    float pf = pzem.pf();
    if(current != NAN){
        Serial.print("PF: "); Serial.println(pf);
    } else {
        Serial.println("Error reading power factor");
    }
    if(power>1.00){
      state = 1;
      Serial.print("State: "); Serial.print(state); Serial.println(" อุปกรณ์กำลังทำงาน");   
      }else{
        state = 0;
      Serial.print("State: "); Serial.print(state); Serial.println(" อุปกรณ์ไม่ทำงาน");  
        }    

    Serial.println();
    //Firebase
    
      
      FirebaseJson data;
      data.set("voltage ", voltage);
      data.set("Current ", current);
      data.set("Power ", power);
      data.set("Energy ", energy);
      data.set("Frequency ", frequency);
      data.set("Power factor ", pf);
      data.set("State ", state);
      data.set("time", getTime());
      data.set("amount ", calBill(energy / 1000, FIX_FT, false));

      

    if(Firebase.pushJSON(firebaseData, "/Projector", data)) {
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

float calBill(float Unit, float ft, bool over_150_Unit_per_month) {
  float Service = over_150_Unit_per_month ? 38.22 : 8.19;

  float total = 0;

  if (!over_150_Unit_per_month) {
    float Rate15 = 2.3488;
    float Rate25 = 2.9882;
    float Rate35 = 3.2405;
    float Rate100 = 3.6237;
    float Rate150 = 3.7171;
    float Rate400 = 4.2218;
    float RateMore400 = 4.4217;

    if (Unit >= 6) total += min(Unit, 15) * Rate15;
    if (Unit >= 16) total += min(Unit - 15, 10) * Rate25;
    if (Unit >= 26) total += min(Unit - 25, 10) * Rate35;
    if (Unit >= 36) total += min(Unit - 35, 65) * Rate100;
    if (Unit >= 101) total += min(Unit - 100, 50) * Rate150;
    if (Unit >= 151) total += min(Unit - 150, 250) * Rate400;
    if (Unit >= 401) total += (Unit - 400) * RateMore400;
  } else {
    float Rate150 = 3.2484;
    float Rate400 = 4.2218;
    float RateMore400 = 4.4217;

    total += min(Unit, 150) * Rate150;
    if (Unit >= 151) total += min(Unit - 150, 150) * Rate400;
    if (Unit >= 401) total += (Unit - 400) * RateMore400;
  }

  total += Service;
  total += Unit * (ft / 100);
  total += total * 7 / 100;

  return total;
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
