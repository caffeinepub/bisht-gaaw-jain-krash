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
export interface GalleryPhoto {
    id: bigint;
    title: string;
    blob: ExternalBlob;
    uploadedAt: bigint;
}
export interface GalleryVideo {
    id: bigint;
    title: string;
    blob: ExternalBlob;
    uploadedAt: bigint;
}
export interface Person {
    name: string;
    profession: string;
    description?: string;
    phoneNumber?: string;
}
export interface backendInterface {
    addPerson(name: string, profession: string, phoneNumber: string | null, description: string | null): Promise<void>;
    addPhoto(title: string, blob: ExternalBlob): Promise<bigint>;
    addVideo(title: string, blob: ExternalBlob): Promise<bigint>;
    getPerson(name: string): Promise<Person | null>;
    getPersons(): Promise<Array<Person>>;
    getPhoto(photoId: bigint): Promise<GalleryPhoto | null>;
    getPhotos(): Promise<Array<GalleryPhoto>>;
    getVideo(videoId: bigint): Promise<GalleryVideo | null>;
    getVideos(): Promise<Array<GalleryVideo>>;
}
