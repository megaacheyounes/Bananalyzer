import { Command } from './command';
import { APK } from '../utils/models/apk';
export default class PackageCommand extends Command {
    exec(): Promise<boolean>;
    downloadOneAPK(packageName: string): Promise<APK | null>;
    clean(): Promise<boolean>;
}
