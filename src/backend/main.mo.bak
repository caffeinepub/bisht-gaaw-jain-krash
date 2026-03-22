import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";


import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let ADMIN_PASSWORD = "bisht@admin2024";

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

  public type VillageInfo = {
    name : Text;
    slogan : Text;
    population : Text;
    houses : Text;
    area : Text;
    literacy : Text;
  };

  // New types for news, contacts, quick services
  public type NewsItem = {
    id : Nat;
    title : Text;
    body : Text;
    tag : Text;
    date : Text;
  };

  public type ServiceContact = {
    id : Nat;
    name : Text;
    phone : Text;
    timing : Text;
    contactType : Text;
  };

  public type QuickService = {
    id : Nat;
    icon : Text;
    name : Text;
    detail : Text;
  };

  // Persistent state
  let userProfiles = Map.empty<Principal, UserProfile>();
  let persons = Map.empty<Text, Person>();
  let photos = Map.empty<Nat, GalleryPhoto>();
  let videos = Map.empty<Int, GalleryVideo>();
  let newsItems = Map.empty<Nat, NewsItem>();
  let serviceContacts = Map.empty<Nat, ServiceContact>();
  let quickServices = Map.empty<Nat, QuickService>();
  let graminProducts = Map.empty<Nat, GraminProduct>();
  let transportEntries = Map.empty<Nat, TransportEntry>();

  // Village info vars (persistent)
  var villageName = "बिष्ट गाँव जैन क्रांश";
  var villageSlogan = "हमारा गाँव, हमारी पहचान — एकता, सेवा और समृद्धि";
  var villagePopulation = "131";
  var villageHouses = "30";
  var villageArea = "33.9 हेक्टेयर";
  var villageLiteracy = "78%";
  var nextPhotoId = 0;
  var nextVideoId = 0 : Int;
  var nextProductId = 0;
  var nextTransportId = 0;

  // New counters for persistent IDs
  var nextNewsId = 0;
  var nextServiceContactId = 0;
  var nextQuickServiceId = 0;

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

  public shared ({ caller }) func addPerson(name : Text, profession : Text, phoneNumber : ?Text, description : ?Text) : async () {
    let person : Person = {
      name;
      profession;
      phoneNumber;
      description;
    };
    persons.add(name, person);
  };

  public shared ({ caller }) func updatePerson(oldName : Text, newName : Text, profession : Text, phoneNumber : ?Text, description : ?Text) : async () {
    persons.remove(oldName);
    let person : Person = {
      name = newName;
      profession;
      phoneNumber;
      description;
    };
    persons.add(newName, person);
  };

  public query ({ caller }) func getPersons() : async [Person] {
    persons.values().toArray();
  };

  public query ({ caller }) func getPerson(name : Text) : async ?Person {
    persons.get(name);
  };

  public shared ({ caller }) func deletePerson(name : Text) : async () {
    persons.remove(name);
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

  public shared ({ caller }) func deletePhoto(photoId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete photos");
    };
    photos.remove(photoId);
  };

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

  public shared ({ caller }) func updateProduct(id : Nat, productName : Text, quantity : Text, pricePerKg : Text, pricePerQtl : Text, contactNumber : Text) : async () {
    switch (graminProducts.get(id)) {
      case (?existing) {
        let updated : GraminProduct = {
          id = existing.id;
          productName;
          quantity;
          pricePerKg;
          pricePerQtl;
          contactNumber;
          addedAt = existing.addedAt;
        };
        graminProducts.add(id, updated);
      };
      case (null) {};
    };
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

  public shared ({ caller }) func updateTransport(id : Nat, vehicleType : Text, departureTime : Text, destination : Text, availableSeats : Nat, contactNumber : Text) : async () {
    switch (transportEntries.get(id)) {
      case (?existing) {
        let updated : TransportEntry = {
          id = existing.id;
          vehicleType;
          departureTime;
          destination;
          availableSeats;
          contactNumber;
          addedAt = existing.addedAt;
        };
        transportEntries.add(id, updated);
      };
      case (null) {};
    };
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

  public shared ({ caller }) func populateDemoProducts() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can populate demo products");
    };

    ignore await addProduct("टमाटर", "10 किलो", "₹40", "₹4000", "9690937766");
    ignore await addProduct("आलू", "20 किलो", "₹25", "₹2500", "9690937767");
    ignore await addProduct("प्याज", "5 किलो", "₹50", "₹5000", "9690937768");
  };

  public shared ({ caller }) func populateDemoTransports() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can populate demo transports");
    };

    ignore await addTransport("Jeep", "10:00 AM", "Main Chauraha", 4, "9721544794");
    ignore await addTransport("Car", "11:00 AM", "Village Market", 2, "9721544795");
    ignore await addTransport("Van", "8:00 AM", "High School", 8, "9721544796");
  };

  public shared ({ caller }) func addNews(title : Text, body : Text, tag : Text, date : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add news");
    };
    let newsId = nextNewsId;
    let news : NewsItem = { id = newsId; title; body; tag; date };
    newsItems.add(newsId, news);
    nextNewsId += 1;
    newsId;
  };

  public shared ({ caller }) func updateNews(id : Nat, title : Text, body : Text, tag : Text, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update news");
    };
    let updatedNews : NewsItem = { id; title; body; tag; date };
    newsItems.add(id, updatedNews);
  };

  public shared ({ caller }) func deleteNews(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete news");
    };
    newsItems.remove(id);
  };

  public query ({ caller }) func getNews() : async [NewsItem] {
    newsItems.values().toArray();
  };

  public shared ({ caller }) func addServiceContact(name : Text, phone : Text, timing : Text, contactType : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add service contacts");
    };
    let id = nextServiceContactId;
    let contact : ServiceContact = { id; name; phone; timing; contactType };
    serviceContacts.add(id, contact);
    nextServiceContactId += 1;
    id;
  };

  public shared ({ caller }) func updateServiceContact(id : Nat, name : Text, phone : Text, timing : Text, contactType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update service contacts");
    };
    let updatedContact : ServiceContact = { id; name; phone; timing; contactType };
    serviceContacts.add(id, updatedContact);
  };

  public shared ({ caller }) func deleteServiceContact(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete service contacts");
    };
    serviceContacts.remove(id);
  };

  public query ({ caller }) func getServiceContacts() : async [ServiceContact] {
    serviceContacts.values().toArray();
  };

  public shared ({ caller }) func addQuickService(icon : Text, name : Text, detail : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add quick services");
    };
    let id = nextQuickServiceId;
    let quickService : QuickService = { id; icon; name; detail };
    quickServices.add(id, quickService);
    nextQuickServiceId += 1;
    id;
  };

  public shared ({ caller }) func updateQuickService(id : Nat, icon : Text, name : Text, detail : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update quick services");
    };
    let updatedQuickService : QuickService = { id; icon; name; detail };
    quickServices.add(id, updatedQuickService);
  };

  public shared ({ caller }) func deleteQuickService(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete quick services");
    };
    quickServices.remove(id);
  };

  public query ({ caller }) func getQuickServices() : async [QuickService] {
    quickServices.values().toArray();
  };
};
