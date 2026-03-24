import { startQR } from "./qrScanner";
import { loadModule } from "./module";

startQR(async (qrValue) => {
    console.log("QR Detected:", qrValue);
    alert("QR Detected: " + qrValue);

    // For now, any QR triggers the module
    await loadModule();
});