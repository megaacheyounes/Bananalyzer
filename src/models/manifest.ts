export interface UsesPermission {
  name: string;
}

export interface UsesSdk {
  minSdkVersion: number;
  targetSdkVersion: number;
}

export interface UsesFeature {
  glEsVersion: number;
  required: boolean;
}

export interface Action {
  name: string;
}

export interface Category {
  name: string;
}

export interface Datum {
  scheme: string;
  host: string;
}

export interface IntentFilter {
  actions: Action[];
  categories: Category[];
  data: Datum[];
}

export interface MetaData {
  name: string;
  value: string;
}

export interface Activity {
  name: string;
  exported: boolean;
  screenOrientation: number;
  intentFilters: IntentFilter[];
  metaData: MetaData[];
  launchMode?: number;
  theme: string;
  label: string;
  configChanges?: number;
  windowSoftInputMode?: number;
  hardwareAccelerated?: boolean;
  process: string;
  excludeFromRecents?: boolean;
  permission: string;
}

export interface Action2 {
  name: string;
}

export interface Category2 {
  name: string;
}

export interface IntentFilter2 {
  actions: Action2[];
  categories: Category2[];
  data: any[];
}

export interface LauncherActivity {
  theme: string;
  name: string;
  launchMode: number;
  screenOrientation: number;
  intentFilters: IntentFilter2[];
  metaData: any[];
}

export interface Action3 {
  name: string;
}

export interface IntentFilter3 {
  actions: Action3[];
  categories: any[];
  data: any[];
  priority?: number;
}

export interface MetaData2 {
  name: string;
  value: string;
}

export interface Service {
  name: string;
  exported: boolean;
  intentFilters: IntentFilter3[];
  metaData: MetaData2[];
  permission: string;
  enabled?: boolean;
}

export interface Action4 {
  name: string;
}

export interface IntentFilter4 {
  actions: Action4[];
  categories: any[];
  data: any[];
}

export interface Receiver {
  name: string;
  intentFilters: IntentFilter4[];
  metaData: any[];
  exported?: boolean;
  permission: string;
  enabled?: boolean;
}

export interface MetaData3 {
  name: string;
  resource: string;
}

export interface Provider {
  name: string;
  exported: boolean;
  authorities: string;
  grantUriPermissions: any[];
  metaData: MetaData3[];
  pathPermissions: any[];
  initOrder?: number;
}

export interface UsesLibrary {
  name: string;
  required: boolean;
}

export interface MetaData4 {
  name: string;
  value: any;
  resource: string;
  screenOrientation?: number;
}

export interface Application {
  theme: string;
  label: string;
  icon: string;
  name: string;
  allowBackup: boolean;
  hardwareAccelerated: boolean;
  supportsRtl: boolean;
  networkSecurityConfig: string;
  roundIcon: string;
  appComponentFactory: string;
  requestLegacyExternalStorage: boolean;
  activities: Activity[];
  activityAliases: any[];
  launcherActivities: LauncherActivity[];
  services: Service[];
  receivers: Receiver[];
  providers: Provider[];
  usesLibraries: UsesLibrary[];
  metaDatas: MetaData4[];
}

export interface Manifest {
  versionCode: number;
  versionName: string;
  compileSdkVersion: number;
  compileSdkVersionCodename: string;
  package: string;
  platformBuildVersionCode: number;
  platformBuildVersionName: number;
  usesPermissions: UsesPermission[];
  permissions: any[];
  permissionTrees: any[];
  permissionGroups: any[];
  instrumentation?: any;
  usesSdk: UsesSdk;
  usesConfiguration?: any;
  usesFeatures: UsesFeature[];
  supportsScreens?: any;
  compatibleScreens: any[];
  supportsGlTextures: any[];
  application: Application;
}
