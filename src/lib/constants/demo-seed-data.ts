// Curated demo data for the permanent demo tenant
// All data is fictional — realistic Spanish names, phones, emails

// ==================== CONTACTS (50) ====================
export interface DemoContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  tags: string[];
}

export const DEMO_CONTACTS: DemoContact[] = [
  { firstName: "María", lastName: "García López", email: "maria.garcia@gmail.com", phone: "+34 611 223 344", source: "web", tags: ["familia", "baqueira"] },
  { firstName: "Carlos", lastName: "Fernández Ruiz", email: "carlos.fernandez@outlook.es", phone: "+34 622 334 455", source: "groupon", tags: ["groupon", "sierra_nevada"] },
  { firstName: "Ana", lastName: "Martínez Sánchez", email: "ana.martinez@hotmail.com", phone: "+34 633 445 566", source: "web", tags: ["pareja", "baqueira"] },
  { firstName: "Pedro", lastName: "Sánchez Gómez", email: "pedro.sg@gmail.com", phone: "+34 644 556 677", source: "referido", tags: ["familia", "formigal"] },
  { firstName: "Laura", lastName: "Díaz Navarro", email: "laura.diaz@yahoo.es", phone: "+34 655 667 788", source: "llamada", tags: ["grupo", "sierra_nevada"] },
  { firstName: "Javier", lastName: "Romero Torres", email: "javi.romero@gmail.com", phone: "+34 666 778 899", source: "web", tags: ["empresa", "baqueira"] },
  { firstName: "Elena", lastName: "Rodríguez Vega", email: "elena.rv@gmail.com", phone: "+34 677 889 900", source: "groupon", tags: ["groupon", "baqueira"] },
  { firstName: "Roberto", lastName: "Jiménez Mora", email: "roberto.j@outlook.es", phone: "+34 688 990 011", source: "groupon", tags: ["groupon", "sierra_nevada"] },
  { firstName: "Patricia", lastName: "Herrera Gil", email: "patricia.h@gmail.com", phone: "+34 699 001 122", source: "web", tags: ["familia", "la_pinilla"] },
  { firstName: "Diego", lastName: "Navarro Castillo", email: "diego.nc@hotmail.com", phone: "+34 610 112 233", source: "llamada", tags: ["solo", "baqueira"] },
  { firstName: "Lucía", lastName: "Moreno Blanco", email: "lucia.moreno@gmail.com", phone: "+34 621 223 334", source: "groupon", tags: ["groupon", "formigal"] },
  { firstName: "Fernando", lastName: "Vega Prieto", email: "fernando.vp@yahoo.es", phone: "+34 632 334 445", source: "groupon", tags: ["groupon", "baqueira"] },
  { firstName: "Marta", lastName: "López Castro", email: "marta.lc@gmail.com", phone: "+34 643 445 556", source: "web", tags: ["pareja", "sierra_nevada"] },
  { firstName: "Adrián", lastName: "Ruiz Domingo", email: "adrian.rd@outlook.es", phone: "+34 654 556 667", source: "referido", tags: ["amigos", "baqueira"] },
  { firstName: "Carmen", lastName: "Giménez Peña", email: "carmen.gp@gmail.com", phone: "+34 665 667 778", source: "web", tags: ["familia", "grandvalira"] },
  { firstName: "Álvaro", lastName: "Domínguez Cruz", email: "alvaro.dc@hotmail.com", phone: "+34 676 778 889", source: "groupon", tags: ["groupon", "baqueira"] },
  { firstName: "Isabel", lastName: "Torres Reyes", email: "isabel.tr@gmail.com", phone: "+34 687 889 990", source: "llamada", tags: ["familia", "formigal"] },
  { firstName: "Pablo", lastName: "Serrano Flores", email: "pablo.sf@yahoo.es", phone: "+34 698 990 001", source: "web", tags: ["solo", "sierra_nevada"] },
  { firstName: "Sofía", lastName: "Ramírez Ortiz", email: "sofia.ro@gmail.com", phone: "+34 609 001 112", source: "groupon", tags: ["groupon", "la_pinilla"] },
  { firstName: "Daniel", lastName: "Molina León", email: "daniel.ml@outlook.es", phone: "+34 620 112 223", source: "referido", tags: ["grupo", "baqueira"] },
  { firstName: "Cristina", lastName: "Álvarez Marín", email: "cristina.am@gmail.com", phone: "+34 631 223 334", source: "web", tags: ["pareja", "grandvalira"] },
  { firstName: "Hugo", lastName: "Suárez Ramos", email: "hugo.sr@hotmail.com", phone: "+34 642 334 445", source: "groupon", tags: ["groupon", "sierra_nevada"] },
  { firstName: "Raquel", lastName: "Medina Santos", email: "raquel.ms@gmail.com", phone: "+34 653 445 556", source: "llamada", tags: ["familia", "baqueira"] },
  { firstName: "Sergio", lastName: "Vargas Pascual", email: "sergio.vp@yahoo.es", phone: "+34 664 556 667", source: "web", tags: ["empresa", "formigal"] },
  { firstName: "Beatriz", lastName: "Guerrero Nieto", email: "beatriz.gn@gmail.com", phone: "+34 675 667 778", source: "groupon", tags: ["groupon", "baqueira"] },
  { firstName: "Iván", lastName: "Muñoz Pardo", email: "ivan.mp@outlook.es", phone: "+34 686 778 889", source: "referido", tags: ["amigos", "sierra_nevada"] },
  { firstName: "Nuria", lastName: "Delgado Vidal", email: "nuria.dv@gmail.com", phone: "+34 697 889 990", source: "web", tags: ["familia", "la_pinilla"] },
  { firstName: "Marcos", lastName: "Fuentes Aguilar", email: "marcos.fa@hotmail.com", phone: "+34 608 990 001", source: "llamada", tags: ["grupo", "grandvalira"] },
  { firstName: "Andrea", lastName: "Iglesias Rubio", email: "andrea.ir@gmail.com", phone: "+34 619 001 112", source: "groupon", tags: ["groupon", "formigal"] },
  { firstName: "Alejandro", lastName: "Crespo Herrero", email: "alex.ch@yahoo.es", phone: "+34 630 112 223", source: "web", tags: ["pareja", "baqueira"] },
  { firstName: "Inés", lastName: "Calvo Montero", email: "ines.cm@gmail.com", phone: "+34 641 223 334", source: "referido", tags: ["familia", "sierra_nevada"] },
  { firstName: "Óscar", lastName: "Peña Cabrera", email: "oscar.pc@outlook.es", phone: "+34 652 334 445", source: "groupon", tags: ["groupon", "baqueira"] },
  { firstName: "Silvia", lastName: "Caballero Esteban", email: "silvia.ce@gmail.com", phone: "+34 663 445 556", source: "web", tags: ["solo", "formigal"] },
  { firstName: "Miguel", lastName: "Cortés Bravo", email: "miguel.cb@hotmail.com", phone: "+34 674 556 667", source: "llamada", tags: ["familia", "grandvalira"] },
  { firstName: "Alicia", lastName: "Gallego Campos", email: "alicia.gc@gmail.com", phone: "+34 685 667 778", source: "web", tags: ["pareja", "baqueira"] },
  { firstName: "Rubén", lastName: "Prieto Lara", email: "ruben.pl@yahoo.es", phone: "+34 696 778 889", source: "groupon", tags: ["groupon", "sierra_nevada"] },
  { firstName: "Teresa", lastName: "Moya Lorenzo", email: "teresa.ml@gmail.com", phone: "+34 607 889 990", source: "referido", tags: ["familia", "la_pinilla"] },
  { firstName: "Víctor", lastName: "León Santiago", email: "victor.ls@outlook.es", phone: "+34 618 990 001", source: "web", tags: ["amigos", "baqueira"] },
  { firstName: "Lorena", lastName: "Ramos Benítez", email: "lorena.rb@gmail.com", phone: "+34 629 001 112", source: "groupon", tags: ["groupon", "formigal"] },
  { firstName: "Gonzalo", lastName: "Pastor Rojas", email: "gonzalo.pr@hotmail.com", phone: "+34 640 112 223", source: "llamada", tags: ["grupo", "sierra_nevada"] },
  { firstName: "Clara", lastName: "Sanz Bermejo", email: "clara.sb@gmail.com", phone: "+34 651 223 334", source: "web", tags: ["familia", "grandvalira"] },
  { firstName: "Ricardo", lastName: "Ibáñez Ferrer", email: "ricardo.if@yahoo.es", phone: "+34 662 334 445", source: "groupon", tags: ["groupon", "baqueira"] },
  { firstName: "Esther", lastName: "Arias Cano", email: "esther.ac@gmail.com", phone: "+34 673 445 556", source: "referido", tags: ["pareja", "formigal"] },
  { firstName: "Alberto", lastName: "Blanco Carrasco", email: "alberto.bc@outlook.es", phone: "+34 684 556 667", source: "web", tags: ["solo", "sierra_nevada"] },
  { firstName: "Natalia", lastName: "Peñalver Soto", email: "natalia.ps@gmail.com", phone: "+34 695 667 778", source: "groupon", tags: ["groupon", "la_pinilla"] },
  { firstName: "Jorge", lastName: "Espinosa Vera", email: "jorge.ev@hotmail.com", phone: "+34 606 778 889", source: "llamada", tags: ["empresa", "baqueira"] },
  { firstName: "Pilar", lastName: "Guerrero Abad", email: "pilar.ga@gmail.com", phone: "+34 617 889 990", source: "web", tags: ["familia", "sierra_nevada"] },
  { firstName: "Tomás", lastName: "Herrero Millán", email: "tomas.hm@yahoo.es", phone: "+34 628 990 001", source: "referido", tags: ["amigos", "grandvalira"] },
  { firstName: "Mónica", lastName: "Pascual Vera", email: "monica.pv@gmail.com", phone: "+34 639 001 112", source: "groupon", tags: ["groupon", "formigal"] },
  { firstName: "Rafael", lastName: "Soler Méndez", email: "rafael.sm@outlook.es", phone: "+34 650 112 223", source: "web", tags: ["familia", "baqueira"] },
];

// ==================== RESERVATIONS (50 total: 35 today + 15 historical) ====================
export interface DemoReservation {
  contactIndex: number; // index into DEMO_CONTACTS
  source: "groupon" | "caja" | "web" | "presupuesto";
  station: string;
  daysOffset: number; // 0 = today, negative = past
  schedule: string;
  totalPrice: number;
  status: "pendiente" | "confirmada" | "sin_disponibilidad";
  paymentMethod?: string;
  couponCode?: string;
  notes?: string;
  services: string;
}

// Today's reservas (35)
const TODAY_RESERVATIONS: DemoReservation[] = [
  // 12 Groupon (8 confirmadas, 2 sin disponibilidad, 2 pendientes)
  { contactIndex: 6, source: "groupon", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-8834", services: "Cursillo + alquiler equipo", notes: "Principiante absoluta" },
  { contactIndex: 7, source: "groupon", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-9921", services: "Cursillo + alquiler equipo" },
  { contactIndex: 10, source: "groupon", station: "formigal", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-5567", services: "Cursillo + alquiler equipo" },
  { contactIndex: 11, source: "groupon", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 275, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-3341", services: "Cursillo + equipo + forfait", notes: "Nivel intermedio" },
  { contactIndex: 15, source: "groupon", station: "baqueira", daysOffset: 0, schedule: "15:00-17:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-7712", services: "Cursillo + alquiler equipo" },
  { contactIndex: 18, source: "groupon", station: "la_pinilla", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 149, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-2245", services: "Cursillo + alquiler equipo" },
  { contactIndex: 21, source: "groupon", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-6698", services: "Cursillo + alquiler equipo" },
  { contactIndex: 24, source: "groupon", station: "baqueira", daysOffset: 0, schedule: "15:00-17:00", totalPrice: 275, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-1189", services: "Cursillo + equipo + forfait" },
  { contactIndex: 28, source: "groupon", station: "formigal", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "sin_disponibilidad", paymentMethod: "groupon", couponCode: "GRP-4420", services: "Cursillo + alquiler equipo", notes: "Sin plazas cursillo mañana" },
  { contactIndex: 31, source: "groupon", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "sin_disponibilidad", paymentMethod: "groupon", couponCode: "GRP-8856", services: "Cursillo + alquiler equipo", notes: "Aforo completo" },
  { contactIndex: 35, source: "groupon", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "pendiente", paymentMethod: "groupon", couponCode: "GRP-5501", services: "Cursillo + alquiler equipo" },
  { contactIndex: 38, source: "groupon", station: "formigal", daysOffset: 0, schedule: "15:00-17:00", totalPrice: 149, status: "pendiente", paymentMethod: "groupon", couponCode: "GRP-9934", services: "Cursillo + alquiler equipo" },
  // 10 Venta en caja (all confirmadas)
  { contactIndex: 9, source: "caja", station: "baqueira", daysOffset: 0, schedule: "10:00-14:00", totalPrice: 120, status: "confirmada", paymentMethod: "efectivo", services: "Forfait día completo" },
  { contactIndex: 3, source: "caja", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 240, status: "confirmada", paymentMethod: "tarjeta", services: "Equipo familia + forfait", notes: "Familia 4 personas" },
  { contactIndex: 13, source: "caja", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "efectivo", services: "Cursillo + equipo" },
  { contactIndex: 19, source: "caja", station: "formigal", daysOffset: 0, schedule: "09:00-14:00", totalPrice: 360, status: "confirmada", paymentMethod: "tarjeta", services: "SnowCamp día completo", notes: "Grupo 3 niños" },
  { contactIndex: 25, source: "caja", station: "baqueira", daysOffset: 0, schedule: "10:00-12:00", totalPrice: 70, status: "confirmada", paymentMethod: "efectivo", services: "Clase particular 1h" },
  { contactIndex: 27, source: "caja", station: "grandvalira", daysOffset: 0, schedule: "10:00-14:00", totalPrice: 95, status: "confirmada", paymentMethod: "tarjeta", services: "Forfait + locker" },
  { contactIndex: 32, source: "caja", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 56, status: "confirmada", paymentMethod: "efectivo", services: "Alquiler equipo 1 día" },
  { contactIndex: 39, source: "caja", station: "baqueira", daysOffset: 0, schedule: "15:00-17:00", totalPrice: 145, status: "confirmada", paymentMethod: "tarjeta", services: "Clase particular 2h x 2 personas" },
  { contactIndex: 43, source: "caja", station: "la_pinilla", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 108, status: "confirmada", paymentMethod: "efectivo", services: "Cursillo infantil + equipo" },
  { contactIndex: 45, source: "caja", station: "baqueira", daysOffset: 0, schedule: "13:00-14:30", totalPrice: 28, status: "confirmada", paymentMethod: "efectivo", services: "Menú montaña" },
  // 8 Desde presupuesto (6 confirmadas, 2 pendientes)
  { contactIndex: 0, source: "presupuesto", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 1240, status: "confirmada", paymentMethod: "transferencia", services: "Pack familia completo 3 días", notes: "Familia 4 — equipo+forfait+cursillo" },
  { contactIndex: 4, source: "presupuesto", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 890, status: "confirmada", paymentMethod: "tarjeta", services: "Pack grupo 5 personas", notes: "Grupo amigos nivel intermedio" },
  { contactIndex: 14, source: "presupuesto", station: "grandvalira", daysOffset: 0, schedule: "09:00-17:00", totalPrice: 2100, status: "confirmada", paymentMethod: "transferencia", services: "Pack familia semana", notes: "Familia 4, 5 días completos" },
  { contactIndex: 22, source: "presupuesto", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 560, status: "confirmada", paymentMethod: "tarjeta", services: "Pack pareja 3 días" },
  { contactIndex: 29, source: "presupuesto", station: "baqueira", daysOffset: 0, schedule: "10:00-14:00", totalPrice: 450, status: "confirmada", paymentMethod: "transferencia", services: "Pack esquí + après-ski" },
  { contactIndex: 34, source: "presupuesto", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 720, status: "confirmada", paymentMethod: "tarjeta", services: "Pack snowcamp + forfait" },
  { contactIndex: 40, source: "presupuesto", station: "formigal", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 680, status: "pendiente", services: "Pack familia 2 días", notes: "Pendiente confirmar fechas" },
  { contactIndex: 46, source: "presupuesto", station: "baqueira", daysOffset: 0, schedule: "09:00-17:00", totalPrice: 1560, status: "pendiente", services: "Pack empresa 6 personas", notes: "Esperando aprobación empresa" },
  // 5 Web (3 confirmadas, 2 pendientes)
  { contactIndex: 2, source: "web", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 275, status: "confirmada", paymentMethod: "tarjeta", services: "Cursillo + equipo + forfait" },
  { contactIndex: 12, source: "web", station: "sierra_nevada", daysOffset: 0, schedule: "10:00-14:00", totalPrice: 420, status: "confirmada", paymentMethod: "tarjeta", services: "Pack pareja 2 días" },
  { contactIndex: 20, source: "web", station: "baqueira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "tarjeta", services: "Cursillo + equipo" },
  { contactIndex: 33, source: "web", station: "grandvalira", daysOffset: 0, schedule: "10:00-13:00", totalPrice: 320, status: "pendiente", services: "Pack familia fin de semana", notes: "Reserva web pendiente pago" },
  { contactIndex: 41, source: "web", station: "baqueira", daysOffset: 0, schedule: "15:00-17:00", totalPrice: 145, status: "pendiente", services: "Clase particular 2h" },
];

// Historical reservations (15 from past 7 days)
const HISTORICAL_RESERVATIONS: DemoReservation[] = [
  { contactIndex: 1, source: "groupon", station: "sierra_nevada", daysOffset: -1, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-1100", services: "Cursillo + equipo" },
  { contactIndex: 5, source: "caja", station: "baqueira", daysOffset: -1, schedule: "10:00-14:00", totalPrice: 275, status: "confirmada", paymentMethod: "efectivo", services: "Equipo + forfait" },
  { contactIndex: 8, source: "web", station: "la_pinilla", daysOffset: -1, schedule: "10:00-13:00", totalPrice: 149, status: "confirmada", paymentMethod: "tarjeta", services: "Cursillo + equipo" },
  { contactIndex: 16, source: "presupuesto", station: "baqueira", daysOffset: -2, schedule: "10:00-13:00", totalPrice: 890, status: "confirmada", paymentMethod: "transferencia", services: "Pack familia 2 días" },
  { contactIndex: 23, source: "groupon", station: "formigal", daysOffset: -2, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-3378", services: "Cursillo + equipo" },
  { contactIndex: 26, source: "caja", station: "sierra_nevada", daysOffset: -3, schedule: "10:00-13:00", totalPrice: 120, status: "confirmada", paymentMethod: "efectivo", services: "Forfait día" },
  { contactIndex: 30, source: "web", station: "baqueira", daysOffset: -3, schedule: "10:00-13:00", totalPrice: 560, status: "confirmada", paymentMethod: "tarjeta", services: "Pack pareja 3 días" },
  { contactIndex: 36, source: "groupon", station: "la_pinilla", daysOffset: -4, schedule: "10:00-13:00", totalPrice: 149, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-7744", services: "Cursillo + equipo" },
  { contactIndex: 37, source: "caja", station: "baqueira", daysOffset: -4, schedule: "10:00-14:00", totalPrice: 240, status: "confirmada", paymentMethod: "tarjeta", services: "Equipo familia" },
  { contactIndex: 42, source: "presupuesto", station: "grandvalira", daysOffset: -5, schedule: "09:00-17:00", totalPrice: 1800, status: "confirmada", paymentMethod: "transferencia", services: "Pack semana grupo" },
  { contactIndex: 44, source: "groupon", station: "sierra_nevada", daysOffset: -5, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-2267", services: "Cursillo + equipo" },
  { contactIndex: 47, source: "caja", station: "baqueira", daysOffset: -6, schedule: "10:00-12:00", totalPrice: 70, status: "confirmada", paymentMethod: "efectivo", services: "Clase particular" },
  { contactIndex: 48, source: "web", station: "formigal", daysOffset: -6, schedule: "10:00-13:00", totalPrice: 275, status: "confirmada", paymentMethod: "tarjeta", services: "Cursillo + equipo + forfait" },
  { contactIndex: 49, source: "groupon", station: "baqueira", daysOffset: -7, schedule: "10:00-13:00", totalPrice: 183, status: "confirmada", paymentMethod: "groupon", couponCode: "GRP-8890", services: "Cursillo + equipo" },
  { contactIndex: 17, source: "caja", station: "sierra_nevada", daysOffset: -7, schedule: "10:00-14:00", totalPrice: 95, status: "confirmada", paymentMethod: "efectivo", services: "Forfait + locker" },
];

export const DEMO_RESERVATIONS = [...TODAY_RESERVATIONS, ...HISTORICAL_RESERVATIONS];

// ==================== QUOTES / PRESUPUESTOS (12) ====================
export interface DemoQuote {
  contactIndex: number;
  destination: string;
  checkIn: number; // days from now
  checkOut: number; // days from now
  adults: number;
  children: number;
  status: "nuevo" | "en_proceso" | "enviado" | "aceptado";
  totalAmount: number;
  wantsForfait: boolean;
  wantsClases: boolean;
  wantsEquipment: boolean;
  notes?: string;
}

export const DEMO_QUOTES: DemoQuote[] = [
  // 3 Nuevo
  { contactIndex: 0, destination: "baqueira", checkIn: 5, checkOut: 10, adults: 2, children: 2, status: "nuevo", totalAmount: 2840, wantsForfait: true, wantsClases: true, wantsEquipment: true, notes: "Primera vez esquiando. Quieren algo cómodo y con clases para los niños." },
  { contactIndex: 5, destination: "sierra_nevada", checkIn: 8, checkOut: 11, adults: 6, children: 0, status: "nuevo", totalAmount: 3200, wantsForfait: true, wantsClases: false, wantsEquipment: true, notes: "Viaje de empresa. 6 adultos nivel intermedio." },
  { contactIndex: 14, destination: "grandvalira", checkIn: 12, checkOut: 17, adults: 2, children: 2, status: "nuevo", totalAmount: 4500, wantsForfait: true, wantsClases: true, wantsEquipment: true, notes: "Familia con presupuesto alto, quieren pack premium." },
  // 4 Enviado
  { contactIndex: 4, destination: "sierra_nevada", checkIn: 3, checkOut: 6, adults: 4, children: 0, status: "enviado", totalAmount: 1680, wantsForfait: true, wantsClases: false, wantsEquipment: true, notes: "Grupo de amigos, nivel intermedio." },
  { contactIndex: 8, destination: "la_pinilla", checkIn: 6, checkOut: 8, adults: 2, children: 1, status: "enviado", totalAmount: 620, wantsForfait: true, wantsClases: true, wantsEquipment: true, notes: "Familia fin de semana." },
  { contactIndex: 19, destination: "baqueira", checkIn: 10, checkOut: 14, adults: 3, children: 0, status: "enviado", totalAmount: 1950, wantsForfait: true, wantsClases: false, wantsEquipment: true, notes: "Grupo amigos nivel avanzado." },
  { contactIndex: 30, destination: "formigal", checkIn: 4, checkOut: 7, adults: 2, children: 0, status: "enviado", totalAmount: 890, wantsForfait: true, wantsClases: true, wantsEquipment: true, notes: "Pareja principiante." },
  // 3 Aceptado
  { contactIndex: 2, destination: "baqueira", checkIn: 2, checkOut: 5, adults: 2, children: 0, status: "aceptado", totalAmount: 1240, wantsForfait: true, wantsClases: false, wantsEquipment: true, notes: "Viaje de pareja, ya pagado." },
  { contactIndex: 22, destination: "baqueira", checkIn: 1, checkOut: 4, adults: 2, children: 3, status: "aceptado", totalAmount: 3100, wantsForfait: true, wantsClases: true, wantsEquipment: true, notes: "Familia numerosa." },
  { contactIndex: 36, destination: "la_pinilla", checkIn: 3, checkOut: 4, adults: 1, children: 0, status: "aceptado", totalAmount: 183, wantsForfait: false, wantsClases: true, wantsEquipment: true, notes: "Solo traveler, cursillo individual." },
  // 2 En Proceso
  { contactIndex: 3, destination: "formigal", checkIn: 7, checkOut: 12, adults: 2, children: 3, status: "en_proceso", totalAmount: 3450, wantsForfait: true, wantsClases: true, wantsEquipment: true, notes: "Familia con presupuesto ajustado." },
  { contactIndex: 23, destination: "sierra_nevada", checkIn: 5, checkOut: 8, adults: 8, children: 0, status: "en_proceso", totalAmount: 4200, wantsForfait: true, wantsClases: false, wantsEquipment: true, notes: "Evento empresa, team building." },
];

// ==================== PIPELINE DEALS (25) ====================
export interface DemoDeal {
  contactIndex: number;
  stage: "nuevo_lead" | "contactado" | "presupuesto_enviado" | "aceptado" | "cerrado";
  value: number;
  name: string;
}

export const DEMO_DEALS: DemoDeal[] = [
  // Nuevo Lead (8)
  { contactIndex: 0, stage: "nuevo_lead", value: 2840, name: "Pack familia Baqueira 5 días" },
  { contactIndex: 5, stage: "nuevo_lead", value: 3200, name: "Grupo empresa Sierra Nevada" },
  { contactIndex: 14, stage: "nuevo_lead", value: 4500, name: "Pack premium Grandvalira" },
  { contactIndex: 27, stage: "nuevo_lead", value: 1200, name: "Grupo 4 amigos Grandvalira" },
  { contactIndex: 32, stage: "nuevo_lead", value: 560, name: "Forfait + equipo Formigal" },
  { contactIndex: 39, stage: "nuevo_lead", value: 890, name: "Pack pareja Sierra Nevada" },
  { contactIndex: 44, stage: "nuevo_lead", value: 375, name: "Cursillo + equipo Sierra Nevada" },
  { contactIndex: 48, stage: "nuevo_lead", value: 680, name: "Pack SnowCamp Formigal" },
  // Contactado (6)
  { contactIndex: 4, stage: "contactado", value: 1680, name: "Grupo amigos Sierra Nevada" },
  { contactIndex: 8, stage: "contactado", value: 620, name: "Familia fin semana La Pinilla" },
  { contactIndex: 16, stage: "contactado", value: 1500, name: "Familia Formigal 3 días" },
  { contactIndex: 19, stage: "contactado", value: 1950, name: "Grupo avanzado Baqueira" },
  { contactIndex: 30, stage: "contactado", value: 890, name: "Pareja principiante Formigal" },
  { contactIndex: 42, stage: "contactado", value: 2100, name: "Pack semana Grandvalira" },
  // Presupuesto Enviado (5)
  { contactIndex: 3, stage: "presupuesto_enviado", value: 3450, name: "Familia Formigal semana" },
  { contactIndex: 23, stage: "presupuesto_enviado", value: 4200, name: "Team building Sierra Nevada" },
  { contactIndex: 33, stage: "presupuesto_enviado", value: 1800, name: "Pack familia Grandvalira" },
  { contactIndex: 37, stage: "presupuesto_enviado", value: 720, name: "Pack 2 días Baqueira" },
  { contactIndex: 46, stage: "presupuesto_enviado", value: 2400, name: "Pack empresa Baqueira" },
  // Aceptado (4)
  { contactIndex: 2, stage: "aceptado", value: 1240, name: "Pareja Baqueira 3 días" },
  { contactIndex: 22, stage: "aceptado", value: 3100, name: "Familia numerosa Baqueira" },
  { contactIndex: 36, stage: "aceptado", value: 183, name: "Cursillo individual La Pinilla" },
  { contactIndex: 40, stage: "aceptado", value: 1560, name: "Pack familia Formigal" },
  // Cerrado (2)
  { contactIndex: 29, stage: "cerrado", value: 450, name: "Pack après-ski Baqueira" },
  { contactIndex: 34, stage: "cerrado", value: 720, name: "SnowCamp + forfait Sierra Nevada" },
];

// ==================== CONVERSATIONS (20) ====================
export interface DemoMessage {
  direction: "inbound" | "outbound";
  body: string;
  minutesAgo: number;
}

export interface DemoConversation {
  contactIndex: number;
  type: "WhatsApp" | "SMS";
  messages: DemoMessage[];
}

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  // 5 New inquiries
  { contactIndex: 0, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Hola! Vi en la web que ofrecéis packs de esquí para familias. Somos 2 adultos y 2 niños, queremos ir a Baqueira en marzo.", minutesAgo: 45 },
    { direction: "outbound", body: "¡Hola María! Claro que sí, tenemos packs familia muy completos para Baqueira. ¿Qué fechas tenéis en mente?", minutesAgo: 38 },
    { direction: "inbound", body: "Del 22 al 27 de marzo, 5 días. Los niños no han esquiado nunca, necesitarían cursillo y equipo.", minutesAgo: 30 },
    { direction: "outbound", body: "Perfecto, os preparo un presupuesto con equipo completo + cursillo para los peques + forfait para todos. Os lo envío hoy mismo.", minutesAgo: 25 },
  ]},
  { contactIndex: 5, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Buenos días, somos una empresa y queremos organizar un team building de esquí en Sierra Nevada. Seríamos 6 personas.", minutesAgo: 120 },
    { direction: "outbound", body: "¡Buenos días! Qué buen plan para el equipo. ¿Tenéis fechas previstas? Tenemos packs especiales para empresas.", minutesAgo: 105 },
    { direction: "inbound", body: "Primera semana de abril si es posible, 3 días. Nivel variado.", minutesAgo: 90 },
  ]},
  { contactIndex: 14, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Hola, estamos buscando un pack premium para Grandvalira, 5 días, familia de 4. ¿Qué opciones hay?", minutesAgo: 180 },
    { direction: "outbound", body: "¡Hola Carmen! Para Grandvalira tenemos packs muy completos. ¿Los niños necesitan escuela de esquí?", minutesAgo: 165 },
    { direction: "inbound", body: "Sí, ambos niños de 8 y 10 años. Queremos todo incluido: equipo, forfait, clases y si es posible SnowCamp.", minutesAgo: 150 },
  ]},
  { contactIndex: 27, type: "SMS", messages: [
    { direction: "inbound", body: "Info precios grupo 4 personas Grandvalira fin semana", minutesAgo: 240 },
    { direction: "outbound", body: "Hola Marcos, para un fin de semana en Grandvalira (4 pers) el pack con forfait+equipo parte de 300€/persona. ¿Necesitáis clases?", minutesAgo: 220 },
  ]},
  { contactIndex: 44, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Hola, ¿tienen disponibilidad para cursillos en La Pinilla este fin de semana?", minutesAgo: 60 },
    { direction: "outbound", body: "¡Hola Natalia! Sí, tenemos plazas para cursillo el sábado. ¿Adulto o infantil?", minutesAgo: 50 },
    { direction: "inbound", body: "Adulto, sería mi primera vez. ¿Incluye equipo?", minutesAgo: 42 },
  ]},
  // 4 Quote negotiations
  { contactIndex: 4, type: "WhatsApp", messages: [
    { direction: "outbound", body: "Laura, te envío el presupuesto actualizado para Sierra Nevada: 4 personas, 3 días, forfait + equipo = 1.680€", minutesAgo: 300 },
    { direction: "inbound", body: "Me parece un poco alto. ¿Hay algún descuento para grupos?", minutesAgo: 280 },
    { direction: "outbound", body: "Puedo aplicar un 10% de descuento en el alquiler de equipo por ser grupo de 4. El total quedaría en 1.520€.", minutesAgo: 260 },
    { direction: "inbound", body: "Ok, lo consulto con los demás y te confirmo mañana.", minutesAgo: 240 },
  ]},
  { contactIndex: 3, type: "WhatsApp", messages: [
    { direction: "outbound", body: "Pedro, aquí tienes el presupuesto para Formigal: familia 2+3, semana completa, todo incluido = 3.450€", minutesAgo: 400 },
    { direction: "inbound", body: "Es un poco más de lo que teníamos pensado gastar. ¿Se puede ajustar algo?", minutesAgo: 380 },
    { direction: "outbound", body: "Podemos quitar el forfait del día de llegada (solo medio día de esquí) y bajar los días de equipo infantil. Así quedaría en 2.950€.", minutesAgo: 360 },
    { direction: "inbound", body: "Eso está mejor. ¿Me puedes enviar el presupuesto actualizado por email?", minutesAgo: 340 },
    { direction: "outbound", body: "¡Claro! Te lo envío ahora mismo a pedro.sg@gmail.com", minutesAgo: 335 },
  ]},
  { contactIndex: 19, type: "WhatsApp", messages: [
    { direction: "outbound", body: "Daniel, presupuesto listo para Baqueira: 3 personas, 4 días, nivel avanzado = 1.950€ (forfait + equipo alta gama)", minutesAgo: 500 },
    { direction: "inbound", body: "¿El equipo alta gama incluye esquís de competición?", minutesAgo: 480 },
    { direction: "outbound", body: "Sí, equipo alta calidad con esquís de gama alta, botas de rendimiento y casco. Lo mejor que tenemos.", minutesAgo: 470 },
  ]},
  { contactIndex: 30, type: "WhatsApp", messages: [
    { direction: "outbound", body: "Inés, el presupuesto para Formigal: pareja principiante, 3 días con cursillo + equipo + forfait = 890€", minutesAgo: 600 },
    { direction: "inbound", body: "Perfecto, nos parece bien. ¿Cómo hacemos para confirmar?", minutesAgo: 580 },
    { direction: "outbound", body: "Te envío un link de pago por transferencia. Una vez confirmado el pago, os reservo todo.", minutesAgo: 570 },
  ]},
  // 3 Groupon submissions
  { contactIndex: 6, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Hola, he comprado un cupón Groupon de esquí. Código: GRP-8834. ¿Cómo lo canjeo?", minutesAgo: 1440 },
    { direction: "outbound", body: "¡Hola Elena! Recibido el cupón GRP-8834. ¿Para qué fecha quieres reservar?", minutesAgo: 1400 },
    { direction: "inbound", body: "Para mañana si hay sitio, estación Baqueira, turno de mañana", minutesAgo: 1380 },
    { direction: "outbound", body: "¡Confirmado! Reserva para mañana en Baqueira, 10:00-13:00. Cursillo + alquiler equipo. Llega 15 min antes para recoger el material.", minutesAgo: 1370 },
    { direction: "inbound", body: "¡Genial! ¿Necesito llevar algo?", minutesAgo: 1360 },
    { direction: "outbound", body: "Solo ropa de abrigo cómoda y el cupón (en el móvil vale). Nosotros te damos todo el equipo: esquís, botas, bastones y casco.", minutesAgo: 1350 },
  ]},
  { contactIndex: 7, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Buenas tardes, tengo cupón Groupon GRP-9921 para Sierra Nevada. ¿Hay disponibilidad este sábado?", minutesAgo: 1200 },
    { direction: "outbound", body: "¡Hola Roberto! Sí, hay plazas para el sábado en Sierra Nevada. ¿Turno de mañana o tarde?", minutesAgo: 1180 },
    { direction: "inbound", body: "Mañana mejor, a las 10:00", minutesAgo: 1160 },
    { direction: "outbound", body: "Perfecto, reservado. Sábado 10:00 en Sierra Nevada. ¡Pásalo genial!", minutesAgo: 1150 },
  ]},
  { contactIndex: 10, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Hola! Cupón GRP-5567, quiero ir a Formigal. ¿Hay sitio el próximo martes?", minutesAgo: 800 },
    { direction: "outbound", body: "¡Hola Lucía! Martes hay disponibilidad en Formigal. Cursillo 10:00-13:00 + equipo completo. ¿Te reservo?", minutesAgo: 780 },
    { direction: "inbound", body: "Sí por favor!", minutesAgo: 770 },
  ]},
  // 3 Reservation confirmations
  { contactIndex: 2, type: "WhatsApp", messages: [
    { direction: "outbound", body: "Ana, tu reserva está confirmada: Baqueira, 22-25 marzo, pareja. Equipo + forfait. Te envío confirmación por email.", minutesAgo: 2000 },
    { direction: "inbound", body: "¡Perfecto! ¿A qué hora tenemos que estar allí?", minutesAgo: 1980 },
    { direction: "outbound", body: "A las 9:45 en la oficina de Skicenter (edificio principal de Baqueira). Os damos el equipo y os indicamos dónde empezar.", minutesAgo: 1970 },
    { direction: "inbound", body: "Genial, muchas gracias!", minutesAgo: 1960 },
  ]},
  { contactIndex: 22, type: "WhatsApp", messages: [
    { direction: "outbound", body: "Raquel, confirmado todo para tu familia en Baqueira: 2 adultos + 3 niños, 3 días con cursillo y equipo completo.", minutesAgo: 2500 },
    { direction: "inbound", body: "¡Estupendo! Los niños están emocionadísimos 😊", minutesAgo: 2480 },
    { direction: "outbound", body: "¡Van a pasarlo genial! Los profes de cursillo infantil son los mejores. Recordad traer gafas de sol y protector solar.", minutesAgo: 2470 },
  ]},
  { contactIndex: 29, type: "WhatsApp", messages: [
    { direction: "outbound", body: "Alejandro, reserva confirmada. Pack esquí + après-ski en Baqueira. Incluye menú montaña y trineos nocturnos.", minutesAgo: 3000 },
    { direction: "inbound", body: "Qué bien! ¿Los trineos son a qué hora?", minutesAgo: 2980 },
    { direction: "outbound", body: "Los trineos nocturnos son a las 19:00. El menú montaña se sirve a las 13:00 en el restaurante de pistas.", minutesAgo: 2970 },
  ]},
  // 2 Complaints/Issues
  { contactIndex: 28, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Hola, acabo de ver que mi reserva sale como 'sin disponibilidad'. ¿Qué ha pasado?", minutesAgo: 100 },
    { direction: "outbound", body: "Hola Andrea, lo sentimos mucho. El cursillo de Formigal por la mañana se ha llenado. ¿Te va bien el turno de tarde (15:00-17:00)?", minutesAgo: 85 },
    { direction: "inbound", body: "La tarde me va mal. ¿Puedo cambiar a otro día?", minutesAgo: 75 },
    { direction: "outbound", body: "Claro, el miércoles hay plazas por la mañana. ¿Te cambio a miércoles 10:00-13:00?", minutesAgo: 65 },
    { direction: "inbound", body: "Sí, perfecto, cámbiame al miércoles", minutesAgo: 55 },
  ]},
  { contactIndex: 31, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Mi cupón GRP-8856 dice sin disponibilidad para Baqueira. ¿No hay nada?", minutesAgo: 200 },
    { direction: "outbound", body: "Hola Óscar, lamentamos la situación. Baqueira está completo hoy. Te puedo ofrecer: 1) Cambio a Sierra Nevada mañana, o 2) Reprogramar para la semana que viene en Baqueira.", minutesAgo: 180 },
    { direction: "inbound", body: "Sierra Nevada mañana me vale, si no hay problema con el cupón", minutesAgo: 160 },
    { direction: "outbound", body: "Sin problema, el cupón es válido para cualquier estación. Te reservo Sierra Nevada mañana a las 10:00. ¡Confirmado!", minutesAgo: 150 },
  ]},
  // 2 Post-service thank you
  { contactIndex: 1, type: "WhatsApp", messages: [
    { direction: "inbound", body: "¡Muchas gracias por todo! Lo pasamos genial en Sierra Nevada. Los monitores fueron increíbles.", minutesAgo: 1500 },
    { direction: "outbound", body: "¡Nos alegra mucho Carlos! Fue un placer teneros. ¿Queréis repetir? Tenemos un 15% de descuento para clientes que repiten 😉", minutesAgo: 1480 },
    { direction: "inbound", body: "Seguro que repetimos! Ya os contactaremos para el próximo viaje.", minutesAgo: 1460 },
  ]},
  { contactIndex: 17, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Pablo aquí. Solo quería deciros que la experiencia en Sierra Nevada fue 10/10. Gracias!", minutesAgo: 2200 },
    { direction: "outbound", body: "¡Muchas gracias Pablo! Es genial saber que lo disfrutaste. Si necesitas algo para la próxima, aquí estamos.", minutesAgo: 2180 },
  ]},
  // 1 Referral
  { contactIndex: 13, type: "WhatsApp", messages: [
    { direction: "inbound", body: "Hola! Mi amigo Adrián me ha recomendado. Quiero organizar algo parecido en Baqueira para un grupo de 5.", minutesAgo: 350 },
    { direction: "outbound", body: "¡Hola! Qué bien que Adrián os recomendó. Para un grupo de 5 en Baqueira tenemos muy buenas opciones. ¿Qué nivel tenéis?", minutesAgo: 330 },
    { direction: "inbound", body: "Somos todos intermedios, ya hemos esquiado varias veces. Queríamos 3 días con forfait y equipo.", minutesAgo: 310 },
    { direction: "outbound", body: "Perfecto, para 5 intermedios en Baqueira 3 días con forfait + equipo sale a unos 390€ por persona. ¿Os preparo presupuesto formal?", minutesAgo: 300 },
    { direction: "inbound", body: "Sí porfa, lo consulto con el grupo y te confirmo.", minutesAgo: 290 },
  ]},
];

// ==================== STATION CAPACITY ====================
export interface DemoCapacity {
  station: string;
  cursillo_max: number;
  cursillo_booked: number;
  clase_max: number;
  clase_booked: number;
}

export const DEMO_CAPACITY: DemoCapacity[] = [
  { station: "baqueira", cursillo_max: 50, cursillo_booked: 43, clase_max: 10, clase_booked: 8 },
  { station: "sierra_nevada", cursillo_max: 30, cursillo_booked: 18, clase_max: 10, clase_booked: 4 },
  { station: "formigal", cursillo_max: 30, cursillo_booked: 12, clase_max: 10, clase_booked: 2 },
  { station: "la_pinilla", cursillo_max: 20, cursillo_booked: 8, clase_max: 5, clase_booked: 1 },
  { station: "grandvalira", cursillo_max: 30, cursillo_booked: 15, clase_max: 10, clase_booked: 3 },
];
