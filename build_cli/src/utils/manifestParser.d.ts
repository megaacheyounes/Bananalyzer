export declare const parseManifest: (xmlContent: string) => Promise<ParsedManifest>;
export interface ParsedManifest {
    manifest: Manifest;
}
export interface Manifest {
    $: ManifestAttrs;
    'uses-permission'?: UsesPermission[];
    queries?: Query[];
    'uses-feature'?: UsesFeature[];
    application: Application[];
}
export interface ManifestAttrs {
    'xmlns:android': string;
    'android:compileSdkVersion': string;
    'android:compileSdkVersionCodename': string;
    package: string;
    platformBuildVersionCode: string;
    platformBuildVersionName: string;
}
export interface UsesPermission {
    $: GeneratedType2;
}
export interface GeneratedType2 {
    'android:name': string;
    'android:maxSdkVersion'?: string;
}
export interface Query {
    intent?: Intent[];
    package?: Package[];
}
export interface Intent {
    action?: Action[];
    data?: Daum[];
    category?: Category[];
}
export interface Action {
    $: GeneratedType3;
}
export interface GeneratedType3 {
    'android:name': string;
}
export interface Daum {
    $: GeneratedType4;
}
export interface GeneratedType4 {
    'android:scheme'?: string;
    'android:mimeType'?: string;
}
export interface Category {
    $: GeneratedType5;
}
export interface GeneratedType5 {
    'android:name': string;
}
export interface Package {
    $: GeneratedType6;
}
export interface GeneratedType6 {
    'android:name': string;
}
export interface UsesFeature {
    $: GeneratedType7;
}
export interface GeneratedType7 {
    'android:name': string;
    'android:required': string;
}
export interface Application {
    $: GeneratedType8;
    'meta-data': Metadata[];
    activity: Activity[];
    service?: Service[];
    receiver?: Receiver[];
    provider?: Provider[];
    'uses-library'?: UsesLibrary[];
    'activity-alias'?: Alias[];
}
export interface GeneratedType8 {
    'android:allowBackup': string;
    'android:appComponentFactory': string;
    'android:fullBackupContent': string;
    'android:icon': string;
    'android:label': string;
    'android:largeHeap': string;
    'android:name': string;
    'android:networkSecurityConfig': string;
    'android:requestLegacyExternalStorage': string;
    'android:resizeableActivity': string;
    'android:supportsRtl': string;
    'android:theme': string;
    'android:usesCleartextTraffic': string;
}
export interface Metadata {
    $: GeneratedType9;
}
export interface GeneratedType9 {
    'android:name': string;
    'android:value'?: string;
    'android:resource'?: string;
}
export interface Activity {
    $: GeneratedType10;
    'intent-filter'?: IntentFilter[];
}
export interface GeneratedType10 {
    'android:configChanges'?: string;
    'android:exported'?: string;
    'android:name': string;
    'android:screenOrientation'?: string;
    'android:theme'?: string;
    'android:launchMode'?: string;
    'android:windowSoftInputMode'?: string;
    'android:label'?: string;
    'android:hardwareAccelerated'?: string;
    'android:clearTaskOnLaunch'?: string;
    'android:stateNotNeeded'?: string;
    'android:excludeFromRecents'?: string;
    'android:noHistory'?: string;
    'android:enabled'?: string;
    'android:process'?: string;
    'android:priority'?: string;
    'android:icon'?: string;
}
export interface IntentFilter {
    data?: Daum3[];
    action?: Action2[];
    category?: Category2[];
}
export interface Daum3 {
    $: GeneratedType11;
}
export interface GeneratedType11 {
    'android:scheme': string;
    'android:host'?: string;
    'android:pathPattern'?: string;
}
export interface Action2 {
    $: GeneratedType12;
}
export interface GeneratedType12 {
    'android:name': string;
}
export interface Category2 {
    $: GeneratedType13;
}
export interface GeneratedType13 {
    'android:name': string;
}
export interface Service {
    $: GeneratedType14;
    'intent-filter'?: IntentFilter2[];
    'meta-data'?: Daum4[];
}
export interface GeneratedType14 {
    'android:exported'?: string;
    'android:name': string;
    'android:enabled'?: string;
    'android:permission'?: string;
    'android:foregroundServiceType'?: string;
    'android:directBootAware'?: string;
    'android:visibleToInstantApps'?: string;
}
export interface Alias {
    $: GeneratedType16;
    'intent-filter': IntentFilter[];
}
export interface GeneratedType16 {
    'android:name': string;
    'android:targetActivity': string;
    'android:permission': string;
    'android:process': string;
}
export interface IntentFilter2 {
    $?: GeneratedType15;
    action: Action3[];
}
export interface GeneratedType15 {
    'android:priority': string;
}
export interface Action3 {
    $: GeneratedType16;
}
export interface GeneratedType16 {
    'android:name': string;
}
export interface Daum4 {
    $: GeneratedType17;
}
export interface GeneratedType17 {
    'android:name': string;
    'android:value': string;
}
export interface Receiver {
    $: GeneratedType18;
    'intent-filter'?: IntentFilter3[];
}
export interface GeneratedType18 {
    'android:exported': string;
    'android:name': string;
    'android:enabled'?: string;
    'android:permission'?: string;
    'android:directBootAware'?: string;
}
export interface IntentFilter3 {
    action: Action4[];
}
export interface Action4 {
    $: GeneratedType19;
}
export interface GeneratedType19 {
    'android:name': string;
}
export interface Provider {
    $: GeneratedType20;
    'meta-data'?: Daum5[];
}
export interface GeneratedType20 {
    'android:authorities': string;
    'android:exported': string;
    'android:name': string;
    'android:grantUriPermissions'?: string;
    'android:enabled'?: string;
    'android:initOrder'?: string;
    'android:directBootAware'?: string;
    'android:readPermission'?: string;
}
export interface Daum5 {
    $: GeneratedType21;
}
export interface GeneratedType21 {
    'android:name': string;
    'android:value'?: string;
    'android:resource'?: string;
}
export interface UsesLibrary {
    $: GeneratedType22;
}
export interface GeneratedType22 {
    'android:name': string;
    'android:required': string;
}
