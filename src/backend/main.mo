import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  include MixinStorage();

  public type Person = {
    name : Text;
    profession : Text;
    phoneNumber : ?Text;
    description : ?Text;
  };

  public type GalleryPhoto = {
    id : Nat;
    title : Text;
    blob : Storage.ExternalBlob;
    uploadedAt : Int;
  };

  public type GalleryVideo = {
    id : Int;
    title : Text;
    blob : Storage.ExternalBlob;
    uploadedAt : Int;
  };

  let persons = Map.empty<Text, Person>();
  let photos = Map.empty<Nat, GalleryPhoto>();
  let videos = Map.empty<Int, GalleryVideo>();

  var nextPhotoId = 0;
  var nextVideoId = 0;

  public shared ({ caller }) func addPerson(name : Text, profession : Text, phoneNumber : ?Text, description : ?Text) : async () {
    let person : Person = {
      name;
      profession;
      phoneNumber;
      description;
    };
    persons.add(name, person);
  };

  public query ({ caller }) func getPersons() : async [Person] {
    persons.values().toArray();
  };

  public shared ({ caller }) func addPhoto(title : Text, blob : Storage.ExternalBlob) : async Nat {
    let photoId = nextPhotoId;
    nextPhotoId += 1;

    let photo : GalleryPhoto = {
      id = photoId;
      title;
      blob;
      uploadedAt = Time.now();
    };

    photos.add(photoId, photo);
    photoId;
  };

  public query ({ caller }) func getPhotos() : async [GalleryPhoto] {
    photos.values().toArray();
  };

  public query ({ caller }) func getPhoto(photoId : Nat) : async ?GalleryPhoto {
    photos.get(photoId);
  };

  public shared ({ caller }) func addVideo(title : Text, blob : Storage.ExternalBlob) : async Int {
    let videoId = nextVideoId;
    nextVideoId += 1;

    let video : GalleryVideo = {
      id = videoId;
      title;
      blob;
      uploadedAt = Time.now();
    };

    videos.add(videoId, video);
    videoId;
  };

  public query ({ caller }) func getVideos() : async [GalleryVideo] {
    videos.values().toArray();
  };

  public query ({ caller }) func getVideo(videoId : Int) : async ?GalleryVideo {
    videos.get(videoId);
  };

  // Helper function to get a person by name
  public query ({ caller }) func getPerson(name : Text) : async ?Person {
    persons.get(name);
  };
};
