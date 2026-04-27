export interface StationData {
  slug: string;
  name: string;
  region: string;
  altitude: string;
  kmPistas: number;
  remontes: number;
  fromPrice: number;
  image: string;
  descriptions: [string, string, string];
  snowQuality: string;
  access: string;
  apreski: string;
}

export const STATIONS: Record<string, StationData> = {
  "baqueira-beret": {
    slug: "baqueira-beret",
    name: "Baqueira Beret",
    region: "Pirineo de Lleida",
    altitude: "1500–2510m",
    kmPistas: 167,
    remontes: 36,
    fromPrice: 189,
    image: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1920&q=80",
    descriptions: [
      "Baqueira Beret es la mayor y más completa estación de esquí de España, situada en el corazón del Pirineo de Lleida. Con más de 167 km de pistas y una cota máxima de 2.510 metros, ofrece nieve garantizada durante toda la temporada invernal.",
      "Sus pistas se adaptan a todos los niveles, desde los amplios trazados perfectos para principiantes hasta los desafíos de las zonas de fuera de pista para esquiadores expertos. La estación cuenta con 36 remontes de última generación que garantizan el mínimo tiempo de espera.",
      "Skicenter te ofrece en Baqueira Beret los mejores paquetes todo incluido: forfait, alquiler de material, clases con monitores certificados y alojamiento a los mejores precios. Reserva ahora y paga solo el 25% por adelantado.",
    ],
    snowQuality: "Nieve garantizada con cotas hasta 2.510m y cañones de nieve artificial",
    access: "A 3h de Barcelona y Valencia, acceso directo por autovía hasta el pie de pistas",
    apreski: "La mejor oferta de après-ski de España: restaurantes de montaña, bares y animación nocturna",
  },
  "sierra-nevada": {
    slug: "sierra-nevada",
    name: "Sierra Nevada",
    region: "Granada",
    altitude: "2100–3398m",
    kmPistas: 110,
    remontes: 21,
    fromPrice: 149,
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
    descriptions: [
      "Sierra Nevada es la única estación de esquí de Europa con vistas al mar. Situada a solo 30 km de Granada, es la elección perfecta para quienes buscan una experiencia única combinando deporte de invierno y patrimonio cultural andaluz.",
      "Con 110 km de pistas y la mayor cota de la Península Ibérica a 3.398 metros, Sierra Nevada garantiza nieve desde diciembre hasta abril. Sus 21 remontes facilitan el acceso a todos los sectores de la montaña.",
      "Desde Skicenter organizamos tu viaje completo a Sierra Nevada: forfaits con descuento, alquiler de esquís de alta gama, clases para todos los niveles y los mejores hoteles próximos a las pistas al mejor precio.",
    ],
    snowQuality: "Nieve soleada con más de 300 días de sol al año a 3.400m de altitud",
    access: "A 30 min de Granada, aeropuerto propio y conexiones directas desde toda España",
    apreski: "Combina esquí con la visita a la Alhambra y la gastronomía granadina",
  },
  "formigal": {
    slug: "formigal",
    name: "Formigal",
    region: "Pirineo de Huesca",
    altitude: "1500–2250m",
    kmPistas: 137,
    remontes: 22,
    fromPrice: 169,
    image: "https://images.unsplash.com/photo-1486648791255-7b327fa1c1d4?auto=format&fit=crop&w=1920&q=80",
    descriptions: [
      "Formigal es la gran estación del Pirineo aragonés, conocida por su amplísimo dominio esquiable de 137 km distribuidos en cuatro valles interconectados: Sextas, Anayet, Izas y Portalet.",
      "La variedad de sus pistas es uno de sus grandes atractivos: desde suaves praderas ideales para aprender hasta exigentes descensos fuera de pista. Sus 22 remontes modernos garantizan el acceso a todos los sectores sin colas.",
      "Los paquetes Skicenter para Formigal incluyen acuerdos exclusivos con los mejores hoteles de Sallent de Gállego y paquetes personalizados con clases, alquiler y forfait en un solo precio.",
    ],
    snowQuality: "Nieve polvo de calidad alpina en cuatro valles orientados al norte",
    access: "A 2h de Zaragoza y 4h de Madrid, acceso por autopista en excelentes condiciones",
    apreski: "Ambiente pirenaico auténtico con termas en Sallent de Gállego y gastronomía aragonesa",
  },
  "alto-campoo": {
    slug: "alto-campoo",
    name: "Alto Campoo",
    region: "Cantabria",
    altitude: "1650–2175m",
    kmPistas: 28,
    remontes: 12,
    fromPrice: 129,
    image: "https://images.unsplash.com/photo-1548777123-e216912df7d8?auto=format&fit=crop&w=1920&q=80",
    descriptions: [
      "Alto Campoo es la joya invernal de Cantabria, una estación íntima y familiar a tan solo 2 horas de Bilbao y Santander. Situada en el macizo de Peña Labra, ofrece una experiencia de esquí auténtica alejada de las multitudes.",
      "Con 28 km de pistas homologadas y 12 remontes, Alto Campoo es el destino perfecto para familias y para quienes se inician en el esquí. Su nieve atlántica, de gran calidad, garantiza excelentes condiciones durante la temporada.",
      "Skicenter te ofrece paquetes especiales para Alto Campoo: clases de iniciación para niños y adultos, alquiler completo de material y las mejores tarifas de forfait. Una escapada perfecta para el invierno cántabro.",
    ],
    snowQuality: "Nieve atlántica de gran calidad, húmeda y compacta, ideal para practicar",
    access: "A 2h de Santander y Bilbao, con acceso sencillo por carretera comarcal",
    apreski: "Ambiente tranquilo y familiar, cocina cántabra de calidad y termalismo cercano",
  },
  "candanchu": {
    slug: "candanchu",
    name: "Candanchú",
    region: "Pirineo de Huesca",
    altitude: "1530–2400m",
    kmPistas: 51,
    remontes: 27,
    fromPrice: 139,
    image: "https://images.unsplash.com/photo-1502301197179-65228ab57f78?auto=format&fit=crop&w=1920&q=80",
    descriptions: [
      "Candanchú, fundada en 1928, es una de las estaciones de esquí más históricas de España. Ubicada en el Pirineo aragonés, en el paso de Somport a escasos kilómetros de la frontera francesa, combina tradición y modernidad.",
      "Sus 51 km de pistas con orientación norte garantizan una excelente conservación de la nieve a lo largo de toda la temporada. Con 27 remontes, Candanchú tiene una de las mejores relaciones km/remonte del Pirineo.",
      "Skicenter colabora con los mejores alojamientos del Valle del Aragón. Diseña tu escapada perfecta con nuestros paquetes de forfait, clases y alquiler a medida para grupos y familias.",
    ],
    snowQuality: "Nieve de orientación norte, bien conservada durante toda la temporada",
    access: "En el paso de Somport, a 2h de Zaragoza y con conexión directa a Francia",
    apreski: "Gastronomía aragonesa y francesa en el Valle del Aragón, con ambiente internacional",
  },
  "astun": {
    slug: "astun",
    name: "Astún",
    region: "Pirineo de Huesca",
    altitude: "1700–2300m",
    kmPistas: 51,
    remontes: 14,
    fromPrice: 139,
    image: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1920&q=80",
    descriptions: [
      "Astún es la vecina de Candanchú en el Valle del Aragón, una estación moderna y dinámica con vistas espectaculares al Pirineo francés. Sus pistas bajan por vertientes bien orientadas para conservar la nieve en óptimas condiciones.",
      "Sus 51 km de pistas y 14 remontes la convierten en una opción equilibrada para todos los niveles. El snowpark de Astún es uno de los más completos del Pirineo, atrayendo a freestylers de toda España.",
      "Los paquetes Skicenter para Astún incluyen forfait con acceso combinado Astún-Candanchú, clases en escuela oficial y alquiler de material de última generación. Una opción inmejorable para los amantes del freestyle.",
    ],
    snowQuality: "Nieve variada con snowpark homologado y pistas bien cuidadas toda la temporada",
    access: "Mismo acceso que Candanchú, con forfait combinado disponible entre ambas estaciones",
    apreski: "Ambiente joven y dinámico con zonas de freestyle y actividades de montaña",
  },
  "la-pinilla": {
    slug: "la-pinilla",
    name: "La Pinilla",
    region: "Segovia",
    altitude: "1500–2273m",
    kmPistas: 24,
    remontes: 14,
    fromPrice: 89,
    image: "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=1920&q=80",
    descriptions: [
      "La Pinilla es la estación de esquí más cercana a Madrid, situada en la Sierra de Ayllón en la provincia de Segovia. A tan solo 2 horas de la capital, es la opción perfecta para escapadas de fin de semana desde el centro de España.",
      "Con 24 km de pistas y 14 remontes, La Pinilla ofrece un ambiente familiar e íntimo. Sus pistas de orientación norte garantizan buenas condiciones de nieve y cuenta con instalaciones excelentes para principiantes.",
      "Skicenter te ofrece los mejores paquetes para La Pinilla: clases de iniciación, alquiler completo y forfait a precios imbatibles. Ideal para que los más pequeños den sus primeros pasos en la nieve sin alejarse de casa.",
    ],
    snowQuality: "Nieve de sierra, fresca y bien gestionada, con pistas perfectas para iniciación",
    access: "La más cercana a Madrid, a 2h en coche por la N-I, sin pasos de montaña difíciles",
    apreski: "Escapada perfecta para fin de semana con restaurantes segovianos y cocido castellano",
  },
};

export function getStation(slug: string): StationData | null {
  return STATIONS[slug] ?? null;
}

export function getOtherStations(excludeSlug: string): StationData[] {
  return Object.values(STATIONS).filter((s) => s.slug !== excludeSlug);
}
