// NOVOSENSE I2C bridge v1.0 – masked temporary AFE writes only; no arbitrary register write, no NVM/OTP operation.
#include <Arduino.h>
#include <Wire.h>
#if defined(ARDUINO_ARCH_ESP32)
const int SDA_PIN=8, SCL_PIN=9;
#endif
char line[100]; size_t used=0; bool overflow=false;
bool allowed(uint8_t addr,uint8_t reg,int n){
 if(n<1||n>24)return false;
 int end=int(reg)+n-1;
 if(!((addr>=8&&addr<=119)||addr==127))return false;
 return (reg==1&&end==1)||(reg==2&&end==2)||(reg>=6&&end<=11)||(reg==0x30&&end==0x30)||(reg>=0xA0&&end<=0xD9);
}
bool readBytes(uint8_t addr,uint8_t reg,uint8_t *out,int n){
 Wire.beginTransmission(addr);Wire.write(reg);
 if(Wire.endTransmission(false)!=0)return false;
 if(Wire.requestFrom((uint8_t)addr,(uint8_t)n)!=(uint8_t)n){while(Wire.available())Wire.read();return false;}
 for(int i=0;i<n;i++){if(!Wire.available())return false;out[i]=Wire.read();}return true;
}
bool writeByte(uint8_t a,uint8_t r,uint8_t v){Wire.beginTransmission(a);Wire.write(r);Wire.write(v);return Wire.endTransmission()==0;}
void reply(unsigned long id,const char *status,const char *body){Serial.print(id);Serial.print(' ');Serial.print(status);Serial.print(' ');Serial.println(body);}
void handle(char *s){
 unsigned long id=0;char cmd[8]={0};unsigned int a=0,r=0;int n=0;char extra=0;
 if(sscanf(s,"%lu %7s",&id,cmd)!=2)return;
 if(!strcmp(cmd,"HELLO")){reply(id,"OK","NOVO-I2C-3");return;}
 if(!strcmp(cmd,"R")&&sscanf(s,"%lu %7s %x %x %d %c",&id,cmd,&a,&r,&n,&extra)==5&&a<=127&&r<=255&&allowed(a,r,n)){
  uint8_t data[24];if(!readBytes(a,r,data,n)){reply(id,"ERR","I2C_NACK_OR_SHORT");return;}
  char out[49];for(int i=0;i<n;i++)snprintf(out+i*2,3,"%02X",data[i]);reply(id,"OK",out);return;
 }
 // NSA2860X: compare original bytes, allow only gain/polarity/raw bits, no EEPROM program commands.
 unsigned int o0,o1,o2,v0,v1,v2;
 if(!strcmp(cmd,"A")&&sscanf(s,"%lu %7s %x %x %x %x %x %x %x %c",&id,cmd,&a,&o0,&o1,&o2,&v0,&v1,&v2,&extra)==9&&a==0x6d&&o0<256&&o1<256&&o2<256&&v0<256&&v1<256&&v2<256){
  uint8_t part=0,status=0,mode=0,old[3],after[3];
  if(!readBytes(a,0xd9,&part,1)||(part&127)!=1||!readBytes(a,2,&status,1)||!(status&2)||(status&0xfc)||!readBytes(a,0x30,&mode,1)||mode!=3||!readBytes(a,0xa4,old,3)||old[0]!=o0||old[1]!=o1||old[2]!=o2||(v0&15)!=(o0&15)||(v0>>4)>14||(v1&252)!=(o1&252)||(v2&254)!=(o2&254)){reply(id,"ERR","AFE_PRECONDITION");return;}
  bool ok=writeByte(a,0x30,0);
  if(ok)ok=writeByte(a,0xa4,v0)&&writeByte(a,0xa5,v1)&&writeByte(a,0xa6,v2)&&readBytes(a,0xa4,after,3)&&after[0]==v0&&after[1]==v1&&after[2]==v2;
  if(!ok){writeByte(a,0xa4,old[0]);writeByte(a,0xa5,old[1]);writeByte(a,0xa6,old[2]);}
  bool active=writeByte(a,0x30,3);
  if(!ok||!active){reply(id,"ERR","AFE_FAILED_RESTART_TEST_CHIP");return;}
  reply(id,"OK","AFE_RAM");return;
 }
 // Single conversion only. No OTP command or configuration writes.
 if(!strcmp(cmd,"M")&&sscanf(s,"%lu %7s %x %d %c",&id,cmd,&a,&n,&extra)==4&&(a==0x6c||a==0x6d)&&(n==0||n==1)){
  uint8_t sys=0,id1=0,id2=0,current=0;
  if(!readBytes(a,1,&id1,1)||!readBytes(a,0xA4,&id2,1)||id1!=id2||!readBytes(a,0xA5,&sys,1)||(sys&0x80)||!readBytes(a,0x30,&current,1)||(current&8)||((current&7)>2)){reply(id,"ERR","MEASUREMENT_MODE_BLOCKED");return;}
  Wire.beginTransmission((uint8_t)a);Wire.write((uint8_t)0x30);Wire.write((uint8_t)(8|n));if(Wire.endTransmission()!=0){reply(id,"ERR","I2C_NACK");return;}reply(id,"OK","STARTED");return;
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
