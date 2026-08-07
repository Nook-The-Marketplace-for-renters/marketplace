import type { PropertyType } from '@/types';

export type Locale = 'en' | 'fr';

export interface LocaleContent {
  header: {
    homeAria: string;
    tagline: string;
    searchPlaceholder: string;
    searchAria: string;
    location: string;
    listCta: string;
    myListings: string;
    accountMenu: string;
  };
  filters: Record<string, string>;
  results: (count: number) => string;
  card: {
    bath: string;
    guestFavorite: string;
    new: string;
    perMonth: string;
    save: string;
    unsave: string;
    prevPhoto: string;
    nextPhoto: string;
    noMatches: string;
  };
  detail: {
    close: string;
    reviews: string;
    petPolicy: string;
    leaseTerm: string;
    hostedBy: string;
    perMonth: string;
    askAI: string;
    sendRequest: string;
  };
  tags: Record<string, string>;
  propertyTypes: Record<PropertyType, string>;
  request: {
    title: string;
    name: string;
    email: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    sentTitle: string;
    sentBody: string;
    close: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    back: string;
    listAnother: string;
    empty: string;
    interested: (count: number) => string;
    noInterest: string;
    signOut: string;
    delete: string;
    deleteConfirm: (title: string) => string;
  };
  onboarding: {
    steps: string[];
    exit: string;
    back: string;
    continueBtn: string;
    publish: string;
    googleHintEnabled: string;
    googleHintDisabled: string;
    successTitle: string;
    successBody: (title: string) => string;
    successCta: string;
    fields: {
      fullName: string;
      email: string;
      phone: string;
      title: string;
      address: string;
      neighbourhood: string;
      propertyType: string;
      unitSize: string;
      bathrooms: string;
      sqft: string;
      description: string;
      amenities: string;
      petPolicy: string;
      leaseTerm: string;
      monthlyRent: string;
      availability: string;
    };
    photosHint: string;
    uploadCta: string;
    listedBy: string;
    profileConfirmHint: string;
    removePhoto: (index: number) => string;
    untitled: string;
    step: (current: number, total: number) => string;
  };
}

export const translations: Record<Locale, LocaleContent> = {
  en: {
    header: {
      homeAria: 'Loua Rental home',
      tagline: 'Rental',
      searchPlaceholder: 'Search by neighbourhood or listing',
      searchAria: 'Search listings',
      location: 'Montreal, QC',
      listCta: 'List your property',
      myListings: 'My listings',
      accountMenu: 'Account menu',
    },
    filters: {
      favorite: 'Guest favorites',
      apartment: 'Apartments',
      loft: 'Lofts',
      condo: 'Condos',
      house: 'Houses',
      studio: 'Studios',
      pets: 'Pet friendly',
      furnished: 'Furnished',
      heat: 'Heat included',
      parking: 'Parking',
      budget: 'Under $1,500',
    },
    results: (count) => `${count} rental${count === 1 ? '' : 's'} in Montreal`,
    card: {
      bath: 'bath',
      guestFavorite: 'Guest favorite',
      new: 'New',
      perMonth: 'CAD / month',
      save: 'Save listing',
      unsave: 'Remove from saved',
      prevPhoto: 'Previous photo',
      nextPhoto: 'Next photo',
      noMatches: 'No listings match those filters yet. Try clearing one.',
    },
    detail: {
      close: 'Close',
      reviews: 'reviews',
      petPolicy: 'Pet policy:',
      leaseTerm: 'Lease term:',
      hostedBy: 'Hosted by',
      perMonth: 'per month',
      askAI: 'Ask the AI',
      sendRequest: 'Send a request',
    },
    tags: {
      'Pets OK': 'Pets OK',
      Furnished: 'Furnished',
      'Heat incl.': 'Heat incl.',
      Parking: 'Parking',
      Balcony: 'Balcony',
      AC: 'AC',
      Elevator: 'Elevator',
      'Near metro': 'Near metro',
      'Laundry in-unit': 'Laundry in-unit',
      'New listing': 'New listing',
    },
    propertyTypes: {
      Apartment: 'Apartment',
      Condo: 'Condo',
      Loft: 'Loft',
      House: 'House',
      Studio: 'Studio',
    },
    request: {
      title: 'Send a request',
      name: 'Full name',
      email: 'Email',
      message: 'Message',
      messagePlaceholder: 'Anything the owner should know? (optional)',
      submit: 'Send request',
      sentTitle: 'Request sent',
      sentBody: "The owner will reach out at the email you provided if it's a fit.",
      close: 'Done',
    },
    dashboard: {
      title: 'My listings',
      subtitle: "Listings you've published and who's reached out.",
      back: 'Back to marketplace',
      listAnother: 'List another property',
      empty: "You haven't listed any properties yet.",
      interested: (count) => `${count} interested renter${count === 1 ? '' : 's'}`,
      noInterest: 'No requests yet.',
      signOut: 'Sign out',
      delete: 'Delete listing',
      deleteConfirm: (title) => `Delete "${title}"? This can't be undone.`,
    },
    onboarding: {
      steps: ['Your profile', 'Property basics', 'Photos', 'Details & amenities', 'Price & availability', 'Review'],
      exit: 'Save & exit',
      back: 'Back',
      continueBtn: 'Continue',
      publish: 'Publish listing',
      googleHintEnabled: 'Or fill in your details manually below.',
      googleHintDisabled: "Google sign-in isn't configured for this app yet — fill in your details manually.",
      successTitle: 'Your listing is live',
      successBody: (title) => `"${title}" is now visible to renters browsing Montreal listings.`,
      successCta: 'Back to marketplace',
      fields: {
        fullName: 'Full name',
        email: 'Email',
        phone: 'Phone (optional)',
        title: 'Listing title',
        address: 'Street address',
        neighbourhood: 'Neighbourhood',
        propertyType: 'Property type',
        unitSize: 'Unit size',
        bathrooms: 'Bathrooms',
        sqft: 'Square footage (optional)',
        description: 'Description',
        amenities: 'Amenities',
        petPolicy: 'Pet policy (optional)',
        leaseTerm: 'Lease term (optional)',
        monthlyRent: 'Monthly rent (CAD)',
        availability: 'Availability',
      },
      photosHint: 'Add a few photos of the space. These stay on your device and are only used to preview your listing.',
      uploadCta: 'Upload photos from your computer',
      listedBy: 'Listed by',
      profileConfirmHint: 'Signed in — confirm or update your details below.',
      removePhoto: (index) => `Remove photo ${index}`,
      untitled: 'Untitled listing',
      step: (current, total) => `Step ${current} of ${total}`,
    },
  },
  fr: {
    header: {
      homeAria: 'Accueil Loua Rental',
      tagline: 'Location',
      searchPlaceholder: 'Rechercher par quartier ou annonce',
      searchAria: 'Rechercher des annonces',
      location: 'Montréal, QC',
      listCta: 'Publier votre propriété',
      myListings: 'Mes annonces',
      accountMenu: 'Menu du compte',
    },
    filters: {
      favorite: 'Coups de cœur',
      apartment: 'Appartements',
      loft: 'Lofts',
      condo: 'Condos',
      house: 'Maisons',
      studio: 'Studios',
      pets: 'Animaux acceptés',
      furnished: 'Meublé',
      heat: 'Chauffage inclus',
      parking: 'Stationnement',
      budget: 'Moins de 1 500 $',
    },
    results: (count) => `${count} logement${count === 1 ? '' : 's'} à Montréal`,
    card: {
      bath: 'sdb',
      guestFavorite: 'Coup de cœur',
      new: 'Nouveau',
      perMonth: 'CAD / mois',
      save: "Sauvegarder l'annonce",
      unsave: 'Retirer des favoris',
      prevPhoto: 'Photo précédente',
      nextPhoto: 'Photo suivante',
      noMatches: "Aucune annonce ne correspond à ces filtres. Essayez d'en retirer un.",
    },
    detail: {
      close: 'Fermer',
      reviews: 'avis',
      petPolicy: 'Politique animaux :',
      leaseTerm: 'Durée du bail :',
      hostedBy: 'Publié par',
      perMonth: 'par mois',
      askAI: "Demander à l'IA",
      sendRequest: 'Envoyer une demande',
    },
    tags: {
      'Pets OK': 'Animaux OK',
      Furnished: 'Meublé',
      'Heat incl.': 'Chauffage incl.',
      Parking: 'Stationnement',
      Balcony: 'Balcon',
      AC: 'Climatisation',
      Elevator: 'Ascenseur',
      'Near metro': 'Près du métro',
      'Laundry in-unit': 'Buanderie privée',
      'New listing': 'Nouvelle annonce',
    },
    propertyTypes: {
      Apartment: 'Appartement',
      Condo: 'Condo',
      Loft: 'Loft',
      House: 'Maison',
      Studio: 'Studio',
    },
    request: {
      title: 'Envoyer une demande',
      name: 'Nom complet',
      email: 'Courriel',
      message: 'Message',
      messagePlaceholder: 'Quelque chose que le propriétaire devrait savoir? (optionnel)',
      submit: 'Envoyer la demande',
      sentTitle: 'Demande envoyée',
      sentBody: 'Le propriétaire vous contactera à l\'adresse fournie si ça correspond.',
      close: 'Terminé',
    },
    dashboard: {
      title: 'Mes annonces',
      subtitle: 'Vos annonces publiées et qui vous a contacté.',
      back: 'Retour au marché',
      listAnother: 'Publier une autre propriété',
      empty: "Vous n'avez encore publié aucune propriété.",
      interested: (count) => `${count} locataire${count === 1 ? '' : 's'} intéressé${count === 1 ? '' : 's'}`,
      noInterest: 'Aucune demande pour le moment.',
      signOut: 'Se déconnecter',
      delete: "Supprimer l'annonce",
      deleteConfirm: (title) => `Supprimer « ${title} »? Cette action est irréversible.`,
    },
    onboarding: {
      steps: ['Votre profil', 'Détails de la propriété', 'Photos', 'Détails et commodités', 'Prix et disponibilité', 'Résumé'],
      exit: 'Enregistrer et quitter',
      back: 'Retour',
      continueBtn: 'Continuer',
      publish: "Publier l'annonce",
      googleHintEnabled: 'Ou remplissez vos informations manuellement ci-dessous.',
      googleHintDisabled: "La connexion Google n'est pas encore configurée — remplissez vos informations manuellement.",
      successTitle: 'Votre annonce est en ligne',
      successBody: (title) => `« ${title} » est maintenant visible pour les locataires à Montréal.`,
      successCta: 'Retour au marché',
      fields: {
        fullName: 'Nom complet',
        email: 'Courriel',
        phone: 'Téléphone (optionnel)',
        title: "Titre de l'annonce",
        address: 'Adresse municipale',
        neighbourhood: 'Quartier',
        propertyType: 'Type de propriété',
        unitSize: 'Taille du logement',
        bathrooms: 'Salles de bain',
        sqft: 'Superficie en pi² (optionnel)',
        description: 'Description',
        amenities: 'Commodités',
        petPolicy: 'Politique animaux (optionnel)',
        leaseTerm: 'Durée du bail (optionnel)',
        monthlyRent: 'Loyer mensuel (CAD)',
        availability: 'Disponibilité',
      },
      photosHint:
        "Ajoutez quelques photos de l'espace. Elles restent sur votre appareil et servent uniquement à prévisualiser votre annonce.",
      uploadCta: 'Téléverser des photos depuis votre ordinateur',
      listedBy: 'Publié par',
      profileConfirmHint: 'Connecté — confirmez ou modifiez vos informations ci-dessous.',
      removePhoto: (index) => `Retirer la photo ${index}`,
      untitled: 'Annonce sans titre',
      step: (current, total) => `Étape ${current} sur ${total}`,
    },
  },
};
