import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

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

  public type VillageInfo = {
    name : Text;
    slogan : Text;
    population : Text;
    houses : Text;
    area : Text;
    literacy : Text;
  };

  // Village info vars
  var villageName = "बिष्ट गाँव जैन क्रांश";
  var villageSlogan = "हमारा गाँव, हमारी पहचान — एकता, सेवा और समृद्धि";
  var villagePopulation = "131";
  var villageHouses = "30";
  var villageArea = "33.9 हेक्टेयर";
  var villageLiteracy = "78%";

  // Admin password (village admin can use this to claim admin role)
  let ADMIN_PASSWORD = "bisht@admin2024";

  let userProfiles = Map.empty<Principal, UserProfile>();
  let persons = Map.empty<Text, Person>();
  let photos = Map.empty<Nat, GalleryPhoto>();
  let videos = Map.empty<Int, GalleryVideo>();

  var nextPhotoId = 0;
  var nextVideoId = 0 : Int;

  // NEW FEATURES
  public type GraminProduct = {
    id : Nat;
    productName : Text;
    quantity : Text;
    pricePerKg : Text;
    pricePerQtl : Text;
    contactNumber : Text;
    addedAt : Int;
  };

  public type TransportEntry = {
    id : Nat;
    vehicleType : Text;
    departureTime : Text;
    destination : Text;
    availableSeats : Nat;
    contactNumber : Text;
    addedAt : Int;
  };

  let graminProducts = Map.empty<Nat, GraminProduct>();
  let transportEntries = Map.empty<Nat, TransportEntry>();
  var nextProductId = 0;
  var nextTransportId = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Claim admin role with password
  public shared ({ caller }) func claimAdminRole(password : Text) : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };
    if (password != ADMIN_PASSWORD) {
      return false;
    };
    // If admin not yet assigned, make this caller admin
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      return true;
    };
    // If already registered as user, upgrade to admin
    switch (accessControlState.userRoles.get(caller)) {
      case (?#user) {
        accessControlState.userRoles.add(caller, #admin);
        return true;
      };
      case (?#admin) { return true };
      case (_) {
        // Register as admin
        accessControlState.userRoles.add(caller, #admin);
        accessControlState.adminAssigned := true;
        return true;
      };
    };
  };

  // Village info
  public query func getVillageInfo() : async VillageInfo {
    {
      name = villageName;
      slogan = villageSlogan;
      population = villagePopulation;
      houses = villageHouses;
      area = villageArea;
      literacy = villageLiteracy;
    };
  };

  public shared ({ caller }) func updateVillageInfo(
    name : Text,
    slogan : Text,
    population : Text,
    houses : Text,
    area : Text,
    literacy : Text
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update village info");
    };
    villageName := name;
    villageSlogan := slogan;
    villagePopulation := population;
    villageHouses := houses;
    villageArea := area;
    villageLiteracy := literacy;
  };

  // Persons - open to all (no login required)
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

  public query ({ caller }) func getPerson(name : Text) : async ?Person {
    persons.get(name);
  };

  // Photos - open to all villagers (no login required)
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

  public shared ({ caller }) func deletePhoto(photoId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete photos");
    };
    photos.remove(photoId);
  };

  // Videos - open to all villagers (no login required)
  public shared ({ caller }) func addVideo(title : Text, blob : Storage.ExternalBlob) : async Int {
    let videoId = nextVideoId;
    nextVideoId += 1 : Int;

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

  public shared ({ caller }) func deleteVideo(videoId : Int) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };
    videos.remove(videoId);
  };

  // GraminProduct functions - open to all (no login required)
  public shared ({ caller }) func addProduct(productName : Text, quantity : Text, pricePerKg : Text, pricePerQtl : Text, contactNumber : Text) : async Nat {
    let product : GraminProduct = {
      id = nextProductId;
      productName;
      quantity;
      pricePerKg;
      pricePerQtl;
      contactNumber;
      addedAt = Time.now();
    };

    graminProducts.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public query ({ caller }) func getProducts() : async [GraminProduct] {
    graminProducts.values().toArray();
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?GraminProduct {
    graminProducts.get(id);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    graminProducts.remove(id);
  };

  // TransportEntry functions - open to all (no login required)
  public shared ({ caller }) func addTransport(vehicleType : Text, departureTime : Text, destination : Text, availableSeats : Nat, contactNumber : Text) : async Nat {
    let newTransport : TransportEntry = {
      id = nextTransportId;
      vehicleType;
      departureTime;
      destination;
      availableSeats;
      contactNumber;
      addedAt = Time.now();
    };

    transportEntries.add(nextTransportId, newTransport);
    nextTransportId += 1;
    newTransport.id;
  };

  public query ({ caller }) func getTransports() : async [TransportEntry] {
    transportEntries.values().toArray();
  };

  public query ({ caller }) func getTransport(id : Nat) : async ?TransportEntry {
    transportEntries.get(id);
  };

  public shared ({ caller }) func deleteTransport(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete transports");
    };
    transportEntries.remove(id);
  };

  // Init products data (NEW)
  public shared ({ caller }) func populateDemoProducts() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can populate demo products");
    };

    ignore await addProduct("टमाटर", "10 किलो", "₹40", "₹4000", "9690937766");
    ignore await addProduct("आलू", "20 किलो", "₹25", "₹2500", "9690937767");
    ignore await addProduct("प्याज", "5 किलो", "₹50", "₹5000", "9690937768");
  };

  // Init transport data (NEW)
  public shared ({ caller }) func populateDemoTransports() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can populate demo transports");
    };

    ignore await addTransport("Jeep", "10:00 AM", "Main Chauraha", 4, "9721544794");
    ignore await addTransport("Car", "11:00 AM", "Village Market", 2, "9721544795");
    ignore await addTransport("Van", "8:00 AM", "High School", 8, "9721544796");
  };
};
