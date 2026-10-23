// src/data/productos.ts
// Datos de ejemplo (mock) del catálogo.
// NOTA: en producción estos datos se reemplazan por GET /api/productos (PostgreSQL).

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  img: string;        // Imagen principal (portada)
  galeria: string[];  // Imágenes adicionales para la galería/lightbox
  destacado?: boolean;
  nuevo?: boolean;
  stock?: number;
}

// Lista de categorías (filtros del catálogo)
export const categorias = [
  "Serum",
  "Crema",
  "Tónico",
  "Mascarilla",
  "Kit",
  "Limpiador",
  "Protector Solar",
  "Aceite",
];

export const productosMock: Producto[] = [
  {
    id: 1,
    nombre: "Serum Revitalizante",
    descripcion:
      "Serum concentrado con vitamina C y ácido hialurónico. Ilumina la piel, reduce manchas y aporta hidratación profunda desde la primera aplicación.",
    precio: 45.0,
    categoria: "Serum",
    img: "https://picsum.photos/seed/serum/600",
    galeria: [
      "https://picsum.photos/seed/serum1/600",
      "https://picsum.photos/seed/serum2/600",
      "https://picsum.photos/seed/serum3/600",
    ],
    destacado: true,
    stock: 85,
  },
  {
    id: 2,
    nombre: "Crema Hidratante Pro",
    descripcion:
      "Crema facial de textura ligera con niacinamida y manteca de karité. Hidratación de 24 horas y barrera cutánea fortalecida para todo tipo de piel.",
    precio: 32.5,
    categoria: "Crema",
    img: "https://picsum.photos/seed/crema/600",
    galeria: [
      "https://picsum.photos/seed/crema1/600",
      "https://picsum.photos/seed/crema2/600",
      "https://picsum.photos/seed/crema3/600",
    ],
    stock: 120,
  },
  {
    id: 3,
    nombre: "Tónico Purificante",
    descripcion:
      "Tónico sin alcohol con hamamelis y agua de rosas. Limpia poros, equilibra el pH y prepara la piel para el resto de la rutina diaria.",
    precio: 28.0,
    categoria: "Tónico",
    img: "https://picsum.photos/seed/tonico/600",
    galeria: [
      "https://picsum.photos/seed/tonico1/600",
      "https://picsum.photos/seed/tonico2/600",
      "https://picsum.photos/seed/tonico3/600",
    ],
    stock: 95,
  },
  {
    id: 4,
    nombre: "Mascarilla Nocturna",
    descripcion:
      "Mascarilla de noche con colágeno y vitamina E. Repara la piel mientras duermes y recupera la luminosidad al despertar.",
    precio: 50.0,
    categoria: "Mascarilla",
    img: "https://picsum.photos/seed/mascarilla/600",
    galeria: [
      "https://picsum.photos/seed/mascarilla1/600",
      "https://picsum.photos/seed/mascarilla2/600",
      "https://picsum.photos/seed/mascarilla3/600",
    ],
    destacado: true,
    stock: 60,
  },
  {
    id: 5,
    nombre: "Serum Anti-Edad Retinol",
    descripcion:
      "Serum de retinol encapsulado que suaviza líneas de expresión y mejora la firmeza. Uso nocturno recomendado.",
    precio: 58.0,
    categoria: "Serum",
    img: "https://picsum.photos/seed/retinol/600",
    galeria: [
      "https://picsum.photos/seed/retinol1/600",
      "https://picsum.photos/seed/retinol2/600",
      "https://picsum.photos/seed/retinol3/600",
    ],
    stock: 70,
  },
  {
    id: 6,
    nombre: "Crema Contorno de Ojos",
    descripcion:
      "Contorno de ojos con cafeína y péptidos. Reduce bolsas y ojeras, hidrata la zona más delicada del rostro.",
    precio: 26.0,
    categoria: "Crema",
    img: "https://picsum.photos/seed/ojos/600",
    galeria: [
      "https://picsum.photos/seed/ojos1/600",
      "https://picsum.photos/seed/ojos2/600",
      "https://picsum.photos/seed/ojos3/600",
    ],
    stock: 110,
  },
  {
    id: 7,
    nombre: "Tónico Exfoliante AHA-BHA",
    descripcion:
      "Exfoliación química suave con ácidos AHA y BHA. Renueva la textura de la piel y desobstruye los poros.",
    precio: 34.0,
    categoria: "Tónico",
    img: "https://picsum.photos/seed/exfoliante/600",
    galeria: [
      "https://picsum.photos/seed/exfoliante1/600",
      "https://picsum.photos/seed/exfoliante2/600",
      "https://picsum.photos/seed/exfoliante3/600",
    ],
    stock: 80,
  },
  {
    id: 8,
    nombre: "Kit Rutina Completa",
    descripcion:
      "Kit integral con serum, crema, tónico y mascarilla. La rutina perfecta para comenzar: limpieza, tratamiento e hidratación.",
    precio: 129.0,
    categoria: "Kit",
    img: "https://picsum.photos/seed/kit/600",
    galeria: [
      "https://picsum.photos/seed/kit1/600",
      "https://picsum.photos/seed/kit2/600",
      "https://picsum.photos/seed/kit3/600",
    ],
    destacado: true,
    stock: 40,
  },
  // ——— Nuevos productos DTLC ———
  {
    id: 9,
    nombre: "Limpiador Suave Espuma",
    descripcion:
      "Gel-espuma de limpieza con extracto de avena y glicerina. Elimina impurezas sin resecar y deja la piel suave y equilibrada.",
    precio: 22.0,
    categoria: "Limpiador",
    img: "https://picsum.photos/seed/limpiador/600",
    galeria: [
      "https://picsum.photos/seed/limpiador1/600",
      "https://picsum.photos/seed/limpiador2/600",
      "https://picsum.photos/seed/limpiador3/600",
    ],
    nuevo: true,
    stock: 150,
  },
  {
    id: 10,
    nombre: "Protector Solar FPS 50+",
    descripcion:
      "Protector solar de amplio espectro, textura ultraligera e invisible. Resistente al agua, ideal para uso diario y clima tropical.",
    precio: 38.0,
    categoria: "Protector Solar",
    img: "https://picsum.photos/seed/solar/600",
    galeria: [
      "https://picsum.photos/seed/solar1/600",
      "https://picsum.photos/seed/solar2/600",
      "https://picsum.photos/seed/solar3/600",
    ],
    nuevo: true,
    destacado: true,
    stock: 90,
  },
  {
    id: 11,
    nombre: "Aceite Facial de Rosa Mosqueta",
    descripcion:
      "Aceite 100% puro de rosa mosqueta con vitamina A natural. Regenera, unifica el tono y aporta brillo saludable sin dejar grasa.",
    precio: 42.0,
    categoria: "Aceite",
    img: "https://picsum.photos/seed/aceite/600",
    galeria: [
      "https://picsum.photos/seed/aceite1/600",
      "https://picsum.photos/seed/aceite2/600",
      "https://picsum.photos/seed/aceite3/600",
    ],
    nuevo: true,
    stock: 55,
  },
  {
    id: 12,
    nombre: "Serum Niacinamida 10%",
    descripcion:
      "Serum de alta concentración de niacinamida. Minimiza poros, controla el sebo y refuerza la barrera cutánea en 4 semanas.",
    precio: 39.0,
    categoria: "Serum",
    img: "https://picsum.photos/seed/niacinamida/600",
    galeria: [
      "https://picsum.photos/seed/niacinamida1/600",
      "https://picsum.photos/seed/niacinamida2/600",
      "https://picsum.photos/seed/niacinamida3/600",
    ],
    nuevo: true,
    stock: 75,
  },
  {
    id: 13,
    nombre: "Mascarilla de Arcilla Verde",
    descripcion:
      "Mascarilla purificante con arcilla verde y extracto de té verde. Absorbe exceso de grasa y deja la piel mate y fresca.",
    precio: 24.5,
    categoria: "Mascarilla",
    img: "https://picsum.photos/seed/arcilla/600",
    galeria: [
      "https://picsum.photos/seed/arcilla1/600",
      "https://picsum.photos/seed/arcilla2/600",
      "https://picsum.photos/seed/arcilla3/600",
    ],
    stock: 100,
  },
  {
    id: 14,
    nombre: "Kit Anti-Edad Premium",
    descripcion:
      "Pack de lujo: serum retinol, crema firming y contorno de ojos. Rutina completa anti-edad con resultados visibles en 30 días.",
    precio: 149.0,
    categoria: "Kit",
    img: "https://picsum.photos/seed/kitanti/600",
    galeria: [
      "https://picsum.photos/seed/kitanti1/600",
      "https://picsum.photos/seed/kitanti2/600",
      "https://picsum.photos/seed/kitanti3/600",
    ],
    destacado: true,
    nuevo: true,
    stock: 25,
  },
  {
    id: 15,
    nombre: "Crema Corporal Manteca de Karité",
    descripcion:
      "Crema corporal densa y nutritiva con manteca de karité y aceite de almendras. Ideal para piel seca y zonas ásperas.",
    precio: 29.0,
    categoria: "Crema",
    img: "https://picsum.photos/seed/corporal/600",
    galeria: [
      "https://picsum.photos/seed/corporal1/600",
      "https://picsum.photos/seed/corporal2/600",
      "https://picsum.photos/seed/corporal3/600",
    ],
    stock: 130,
  },
  {
    id: 16,
    nombre: "Limpiador Aceite Bifásico",
    descripcion:
      "Aceite limpiador bifásico que disuelve maquillaje waterproof y filtro solar. Se transforma en leche al contacto con agua.",
    precio: 31.0,
    categoria: "Limpiador",
    img: "https://picsum.photos/seed/bifasico/600",
    galeria: [
      "https://picsum.photos/seed/bifasico1/600",
      "https://picsum.photos/seed/bifasico2/600",
      "https://picsum.photos/seed/bifasico3/600",
    ],
    nuevo: true,
    stock: 65,
  },
];
