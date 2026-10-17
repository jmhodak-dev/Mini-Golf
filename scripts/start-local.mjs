import {networkInterfaces} from 'node:os';
import '../server.js';
const port=process.env.PORT||3000;
console.log('\nWILD PUTT — FAMILY GAME NIGHT\n');
console.log('Keep this window open. Connect your phone to the same Wi-Fi as this PC.');
console.log('Open one of these addresses in your phone browser:\n');
let found=false;
for(const [name,addresses] of Object.entries(networkInterfaces())){
 for(const address of addresses||[]){
  if(address.family==='IPv4'&&!address.internal){console.log(`  ${name}: http://${address.address}:${port}`);found=true;}
 }
}
if(!found)console.log('  Connect this PC to Wi-Fi or Ethernet, then restart the game.');
console.log('\nUse the Wi-Fi/Ethernet address. Choose Play with friends for separate phones.');
console.log('If Windows Firewall asks, allow Node.js on your private/home network.');
console.log('Press Ctrl+C to stop hosting.\n');
