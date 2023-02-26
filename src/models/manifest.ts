export interface AndroidManifest {
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
  queries: Query[];
  supportsScreens?: any;
  compatibleScreens: any[];
  supportsGlTextures: any[];
  application: Application;
}

export interface Application {
  theme: string;
  label: string;
  icon: string;
  name: string;
  allowBackup?: boolean;
  hardwareAccelerated?: boolean;
  supportsRtl?: boolean;
  networkSecurityConfig: string;
  roundIcon?: string;
  appComponentFactory: string;
  requestLegacyExternalStorage?: boolean;
  activities: Activity[];
  activityAliases?: any[];
  launcherActivities: Activity[];
  services: Service[];
  receivers: Receiver[];
  providers: Provider[];
  usesLibraries: UsesLibrary[];
  metaData: MetaData[];
}

export interface Query {
  intent: Intent[];
  package: Package[];
}

export interface Intent {
  action?: Action[];
  data?: IntentData[];
  category?: IntentCategory[];
}

export interface IntentData {
  scheme?: string;
  mimeType?: string;
}

export interface IntentCategory {
  name: string;
}

export interface Package {
  name: string;
}

export interface UsesPermission {
  name: string;
  maxSdkVersion?: string;
}

export interface UsesSdk {
  minSdkVersion: number;
  targetSdkVersion: number;
}

export interface UsesFeature {
  name: string;
  glEsVersion?: number;
  required: boolean;
}

export interface Action {
  name: string;
}

export interface Category {
  name: string;
}

export interface IntentFilterData {
  scheme?: string;
  host?: string;
  pathPattern?: string;
}

export interface IntentFilter {
  action?: Action[];
  category?: Category[];
  data?: IntentFilterData[];
  priority?: number;
  autoVerify?: boolean;
}

export interface MetaData {
  name: string;
  value?: string;
  resource?: string;
  screenOrientation?: number;
}

export interface Activity {
  name: string;
  exported?: boolean;
  screenOrientation?: string;
  intentFilters?: IntentFilter[];
  metaData?: MetaData[];
  launchMode?: string;
  theme?: string;
  label?: string;
  configChanges?: string;
  windowSoftInputMode?: string;
  hardwareAccelerated?: boolean;
  process?: string;
  excludeFromRecents?: boolean;
  permission?: string;
}

export interface Service {
  name: string;
  exported?: boolean;
  intentFilters?: IntentFilter[];
  metaData?: MetaData[];
  permission?: string;
  enabled?: boolean;
}

export interface Receiver {
  name: string;
  intentFilters?: IntentFilter[];
  metaData?: any[];
  exported?: boolean;
  permission?: string;
  enabled?: boolean;
}

export interface Provider {
  name: string;
  exported: boolean;
  authorities?: string;
  grantUriPermissions?: any[];
  metaData?: MetaData[];
  pathPermissions?: any[];
  initOrder?: number;
}

export interface UsesLibrary {
  name: string;
  required: boolean;
}
