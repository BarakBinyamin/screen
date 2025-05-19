#include <ESP32-HUB75-MatrixPanel-I2S-DMA.h>
#include <WiFi.h>
#include <ESPmDNS.h>
]
WiFiServer server(1234); // Listening on port 1234

MatrixPanel_I2S_DMA* display;  

void setup(){
  Serial.begin(115200);

  // Setup a config structure
  HUB75_I2S_CFG mxconfig(
    64,  // Width
    64,  // Height
    1    // Num panels
  );

  mxconfig.gpio.e = 18; 

  // Create display object
  display = new MatrixPanel_I2S_DMA(mxconfig); 
  display->begin();
  display->setBrightness8(90);
  display->setTextSize(1);     // size 1 == 8 pixels high

  /////////
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("📡 IP address: ");
  Serial.println(WiFi.localIP());

  // Start TCP server
  server.begin();
  Serial.println("🔌 TCP server started on port 1234.");

  // Start mDNS responder with hostname "jason-calc"
  if (!MDNS.begin("jason-calc")) {
    Serial.println("Error setting up mDNS responder!");
  } else {
    Serial.println("mDNS responder started as jason-calc.local");
  }
}

void loop(){
  WiFiClient client = server.available();

  if (client) {
    Serial.println("📥 Client connected.");
    while (client.connected()) {
      int index =0;
      if(client.available()){
        display->clearScreen();
        display->setCursor(28, 20);
      }
      while (client.available() && index<4096) {
        char c = client.read();
        // if(c == '0'){
        //   //display->drawPixel(index%64, index/64, display->color565(0, 0, 0)); // off
        // }else{
        //   //display->drawPixel(index%64, index/64, display->color565(255, 0, 0)); // White
        // }
        display->print(c);
        index++;
      }
    }
    Serial.println("❌ Client disconnected.");
    client.stop();
  }

  // int index = 0;
  // if (Serial.available()){
  //   // Read bytes from Serial until we get 4096 bits (0 or 1 characters)
  //   while (Serial.available() && index < 4096) {
  //     char c = Serial.read();
  //     if (c == '0'){
  //       display->drawPixel(index%64, index/64, display->color565(0, 0, 0)); // off
  //     }else{
  //       display->drawPixel(index%64, index/64, display->color565(255, 0, 0)); // White
  //     }
  //     index++;
  //   }
  //   Serial.println("");
  //   Serial.flush();
  // }
  // delay(20);
}
