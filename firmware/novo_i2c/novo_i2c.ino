// NOVOSENSE I2C bridge v1.0 – no arbitrary register write, no NVM/OTP operation.
#include <Arduino.h>
#include <Wire.h>
#if defined(ARDUINO_ARCH_ESP32)
const int SDA_PIN=8, SCL_PIN=9;
#endif
char line[100]; size_t used=0; bool overflow=false;
bool allowed(uint8_t addr,uint8_t reg,int n){
 if(n<1||n>24)return false;
 int end=int(reg)+n-1;
 if(addr!=0x6c&&addr!=0x6d)return false;
 return (reg==1&&end==1)||(reg==2&&end==2)||(reg>=6&&end<=11)||(reg==0x30&&end==0x30)||(reg>=0xA1&&end<=0xD9);
}
bool readBytes(uint8_t addr,uint8_t reg,uint8_t *out,int n){
 Wire.beginTransmission(addr);Wire.write(reg);
 if(Wire.endTransmission(false)!=0)return false;
 if(Wire.requestFrom((uint8_t)addr,(uint8_t)n)!=(uint8_t)n){while(Wire.available())Wire.read();return false;}
 for(int i=0;i<n;i++){if(!Wire.available())return false;out[i]=Wire.read();}return true;
}
void reply(unsigned long id,const char *status,const char *body){Serial.print(id);Serial.print(' ');Serial.print(status);Serial.print(' ');Serial.println(body);}
void handle(char *s){
 unsigned long id=0;char cmd[8]={0};unsigned int a=0,r=0;int n=0;char extra=0;
 if(sscanf(s,"%lu %7s",&id,cmd)!=2)return;
 if(!strcmp(cmd,"HELLO")){reply(id,"OK","NOVO-I2C-1");return;}
 if(!strcmp(cmd,"R")&&sscanf(s,"%lu %7s %x %x %d %c",&id,cmd,&a,&r,&n,&extra)==5&&a<=127&&r<=255&&allowed(a,r,n)){
  uint8_t data[24];if(!readBytes(a,r,data,n)){reply(id,"ERR","I2C_NACK_OR_SHORT");return;}
  char out[49];for(int i=0;i<n;i++)snprintf(out+i*2,3,"%02X",data[i]);reply(id,"OK",out);return;
 }
 // Single conversion only. No OTP command or configuration writes.
 if(!strcmp(cmd,"M")&&sscanf(s,"%lu %7s %x %d %c",&id,cmd,&a,&n,&extra)==4&&(a==0x6c||a==0x6d)&&(n==0||n==1)){
  uint8_t sys=0,id1=0,id2=0,current=0;
  if(!readBytes(a,1,&id1,1)||!readBytes(a,0xA4,&id2,1)||id1!=id2||!readBytes(a,0xA5,&sys,1)||(sys&0x80)||!readBytes(a,0x30,&current,1)||(current&8)||((current&7)>2)){reply(id,"ERR","MEASUREMENT_MODE_BLOCKED");return;}
  Wire.beginTransmission(a);Wire.write((uint8_t)0x30);Wire.write((uint8_t)(8|n));if(Wire.endTransmission()!=0){reply(id,"ERR","I2C_NACK");return;}reply(id,"OK","STARTED");return;
 }
 reply(id,"ERR","COMMAND_BLOCKED");
}
void setup(){
 Serial.begin(115200);
#if defined(ARDUINO_ARCH_ESP32)
 Wire.begin(SDA_PIN,SCL_PIN,100000);Wire.setTimeOut(100);
#else
 Wire.begin();Wire.setClock(100000);
 #if defined(WIRE_HAS_TIMEOUT)
 Wire.setWireTimeout(100000,true);
 #endif
#endif
}
void loop(){while(Serial.available()){char c=Serial.read();if(c=='\r')continue;if(c=='\n'){if(!overflow){line[used]=0;handle(line);}used=0;overflow=false;}else if(used<sizeof(line)-1&&!overflow)line[used++]=c;else overflow=true;}}
