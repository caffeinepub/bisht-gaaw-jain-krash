import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface GraminProduct {
    id: bigint;
    pricePerKg: string;
    productName: string;
    pricePerQtl: string;
    addedAt: bigint;
    quantity: string;
    contactNumber: string;
}
export interface GalleryPhoto {
    id: bigint;
    title: string;
    blob: ExternalBlob;
    uploadedAt: bigint;
}
export interface ServiceContact {
    id: bigint;
    contactType: string;
    timing: string;
    name: string;
    phone: string;
}
export interface NewsItem {
    id: bigint;
    tag: string;
    title: string;
    body: string;
    date: string;
}
export interface TransportEntry {
    id: bigint;
    vehicleType: string;
    destination: string;
    departureTime: string;
    addedAt: bigint;
    availableSeats: bigint;
    contactNumber: string;
}
export interface QuickService {
    id: bigint;
    icon: string;
    name: string;
    detail: string;
}
export interface GalleryVideo {
    id: bigint;
    title: string;
    blob: ExternalBlob;
    uploadedAt: bigint;
}
export interface VillageInfo {
    literacy: string;
    area: string;
    name: string;
    slogan: string;
    houses: string;
    population: string;
}
export interface Person {
    name: string;
    profession: string;
    description?: string;
    phoneNumber?: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNews(title: string, body: string, tag: string, date: string): Promise<bigint>;
    addPerson(name: string, profession: string, phoneNumber: string | null, description: string | null): Promise<void>;
    addPhoto(title: string, blob: ExternalBlob): Promise<bigint>;
    addProduct(productName: string, quantity: string, pricePerKg: string, pricePerQtl: string, contactNumber: string): Promise<bigint>;
    addQuickService(icon: string, name: string, detail: string): Promise<bigint>;
    addServiceContact(name: string, phone: string, timing: string, contactType: string): Promise<bigint>;
    addTransport(vehicleType: string, departureTime: string, destination: string, availableSeats: bigint, contactNumber: string): Promise<bigint>;
    addVideo(title: string, blob: ExternalBlob): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminRole(password: string): Promise<boolean>;
    deleteNews(id: bigint): Promise<void>;
    deletePerson(name: string): Promise<void>;
    deletePhoto(photoId: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deleteQuickService(id: bigint): Promise<void>;
    deleteServiceContact(id: bigint): Promise<void>;
    deleteTransport(id: bigint): Promise<void>;
    deleteVideo(videoId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNews(): Promise<Array<NewsItem>>;
    getPerson(name: string): Promise<Person | null>;
    getPersons(): Promise<Array<Person>>;
    getPhoto(photoId: bigint): Promise<GalleryPhoto | null>;
    getPhotos(): Promise<Array<GalleryPhoto>>;
    getProduct(id: bigint): Promise<GraminProduct | null>;
    getProducts(): Promise<Array<GraminProduct>>;
    getQuickServices(): Promise<Array<QuickService>>;
    getServiceContacts(): Promise<Array<ServiceContact>>;
    getTransport(id: bigint): Promise<TransportEntry | null>;
    getTransports(): Promise<Array<TransportEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(videoId: bigint): Promise<GalleryVideo | null>;
    getVideos(): Promise<Array<GalleryVideo>>;
    getVillageInfo(): Promise<VillageInfo>;
    isCallerAdmin(): Promise<boolean>;
    populateDemoProducts(): Promise<void>;
    populateDemoTransports(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateNews(id: bigint, title: string, body: string, tag: string, date: string): Promise<void>;
    updatePerson(oldName: string, newName: string, profession: string, phoneNumber: string | null, description: string | null): Promise<void>;
    updateProduct(id: bigint, productName: string, quantity: string, pricePerKg: string, pricePerQtl: string, contactNumber: string): Promise<void>;
    updateQuickService(id: bigint, icon: string, name: string, detail: string): Promise<void>;
    updateServiceContact(id: bigint, name: string, phone: string, timing: string, contactType: string): Promise<void>;
    updateTransport(id: bigint, vehicleType: string, departureTime: string, destination: string, availableSeats: bigint, contactNumber: string): Promise<void>;
    updateVillageInfo(name: string, slogan: string, population: string, houses: string, area: string, literacy: string): Promise<void>;
}
