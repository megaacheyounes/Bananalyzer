import { Command } from './command';
export default class ApkCommand extends Command {
    exec(): Promise<boolean>;
}
