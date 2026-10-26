// Treść portfolio działu. Bez nazw klientów, użytkowników końcowych, lokalizacji i autorów.
// Źródło: repozytoria projektowe działu (README, rejestry maszyn, struktura projektów PLC/HMI).

export const stats = [
  { value: '180', label: 'repozytoriów projektów PLC, HMI i SCADA' },
  { value: '60+', label: 'zrealizowanych projektów aplikacyjnych' },
  { value: '40+', label: 'obsłużonych klientów z kraju i zagranicy' },
  { value: '17', label: 'krajów, do których trafiły nasze maszyny seryjne' }
];

export const categories = ['Wszystkie', 'Maszyny seryjne', 'Linie i instalacje'];

// media.video: film producenta maszyny (YouTube), start = początek 15-sekundowego fragmentu w podglądzie karty.
// Projekty bez zdjęć i filmów producenta nie trafiają na listę — wybieramy wtedy inne repozytorium.
// control: schemat sterowania rysowany w oknie szczegółów (poziom nadrzędny → sterownik → urządzenia wykonawcze).
export const projects = [
  {
    id: 'pila-kamien',
    title: 'Piła mostowa 5 osi do obróbki kamienia',
    category: 'Maszyny seryjne',
    sector: 'Producent maszyn do obróbki kamienia',
    media: {
      photo: 'assets/img/projects/pila-kamien.jpg',
      alt: 'Piła mostowa do cięcia płyt kamiennych w hali produkcyjnej',
      video: { id: 'ZxMkAq89g_w', start: 80 }
    },
    summary: 'Pięcioosiowa piła jednosuportowa rozwijana jako produkt seryjny — jedna aplikacja, kilkadziesiąt maszyn w Polsce i Europie.',
    facts: [['35+', 'maszyn w rejestrze'], ['5', 'osi ruchu'], ['8', 'krajów']],
    challenge: 'Producent potrzebował jednej, rozwijanej latami aplikacji, która obsłuży różne warianty wyposażenia: przekładnie, enkodery, panele 15″ i 24″, czujnik tarczy czy pilot bezprzewodowy.',
    solution: 'Sterownik PLC na platformie CODESYS steruje osiami na serwonapędach i falownikach. Panel HMI prowadzi operatora przez programy cięcia. Każda maszyna ma wpis w rejestrze z wersją programu i konfiguracją sprzętu, więc serwis wie, co dokładnie pracuje u klienta.',
    scope: ['Aplikacja PLC i HMI', 'Sterowanie serwonapędami i falownikami', 'Wizualizacja cięcia 3D przez OPC UA', 'Rejestr wersji dla każdej maszyny'],
    tech: ['PLC CODESYS', 'HMI 15–24″', 'Serwonapędy', 'OPC UA'],
    control: {
      top: ['Panel HMI 15–24″', 'Wizualizacja 3D (OPC UA)', 'Zdalny serwis'],
      plc: 'PLC CODESYS',
      bus: 'EtherCAT',
      field: ['Serwonapędy osi', 'Falowniki', 'Moduły I/O', 'Enkoder', 'Czujnik tarczy', 'Pilot radiowy']
    }
  },

  {
    id: 'zgrzewarki-workow',
    title: 'Zgrzewarki do produkcji worków foliowych',
    category: 'Maszyny seryjne',
    sector: 'Producent maszyn do przetwórstwa folii',
    media: {
      photo: 'assets/img/projects/zgrzewarka-workow.jpg',
      alt: 'Transporter zgrzewarki odkładający worki foliowe do kartonu',
      video: { id: 'r3PvceIGd2I', start: 3 }
    },
    summary: 'Modułowa aplikacja dla rodziny zgrzewarek i rolomatów, uruchamianych u klientów na trzech kontynentach.',
    facts: [['20+', 'maszyn od 2024 r.'], ['10', 'krajów eksportu'], ['4', 'warianty maszyny']],
    challenge: 'Każda maszyna z serii ma inny zestaw modułów: zgrzew prosty, łukowy, z perforacją, stacker, pudrownica, automatyczny nawijacz. Warianty Economy i Simple dochodzą do wersji wąskiej i szerokiej.',
    solution: 'Aplikację podzielono na moduły włączane konfiguracją. Nowsze moduły zgrzewu łukowego pracują na osiach serwo. Hamulce proszkowe odwijaka są sterowane sygnałem 0–20 mA, a bufor folii mierzony czujnikiem prądowym. Do starszych maszyn powstała niezależna pudrownica z trzema trybami pracy.',
    scope: ['Modułowa aplikacja PLC i HMI', 'Osie serwo w modułach zgrzewu', 'Regulacja naciągu folii', 'Rejestr konfiguracji każdej maszyny'],
    tech: ['PLC CODESYS', 'Wejścia 0–20 mA', 'Serwonapędy', 'Silniki krokowe'],
    control: {
      top: ['Panel HMI', 'Konfiguracja modułów maszyny'],
      plc: 'PLC CODESYS',
      bus: 'Sieć napędów i I/O',
      field: ['Moduły zgrzewu (serwo)', 'Odwijak + hamulec 0–20 mA', 'Stacker', 'Transporter', 'Pudrownica', 'Nawijacz']
    }
  },
  {
    id: 'maszyna-kartony',
    title: 'Maszyna do pudełek z tektury na krótkie serie',
    category: 'Maszyny seryjne',
    sector: 'Producent maszyn do opakowań kartonowych',
    media: {
      photo: 'assets/img/projects/maszyna-kartony.jpg',
      alt: 'Maszyna do produkcji pudełek z tektury falistej z panelem operatora',
      video: { id: 'fYSw30Xg8fY', start: 7 }
    },
    summary: 'Aplikacja sterownika dla kompaktowej maszyny, która z arkusza tektury robi pudełko na wymiar — bez wykrojników.',
    facts: [['CODESYS', 'platforma sterownika'], ['1', 'biblioteka funkcji maszyny'], ['2026', 'realizacja']],
    challenge: 'Producent rozwija rodzinę maszyn do pudełek. Każda wersja ma wspólne funkcje, ale inny zestaw zespołów i ekranów.',
    solution: 'Logikę maszyny wydzielono do osobnej biblioteki, którą projekt wersji tylko wykorzystuje. Panel operatora prowadzi przez wybór pudełka i wymiarów. Przykład kalkulatora formatek pokazujemy niżej w sekcji kodu.',
    scope: ['Aplikacja PLC', 'Biblioteka funkcji maszyny', 'Panel operatora', 'Przygotowanie pod kolejne wersje'],
    tech: ['PLC CODESYS', 'Biblioteki', 'HMI', 'Napędy'],
    control: {
      top: ['Panel operatora', 'Receptury pudełek'],
      plc: 'PLC CODESYS + biblioteka maszyny',
      bus: 'Sieć napędów i I/O',
      field: ['Podajnik arkuszy', 'Noże i bigi', 'Osie pozycjonowania', 'Czujniki arkusza', 'Wyjście pudełek']
    }
  },
  {
    id: 'automat-zaluzje',
    title: 'Automat do produkcji żaluzji',
    category: 'Maszyny seryjne',
    sector: 'Producent maszyn do rolet i żaluzji',
    media: {
      photo: 'assets/img/projects/automat-zaluzje.jpg',
      alt: 'Automat do produkcji żaluzji poziomych',
      video: { id: 'fPZLL5Wu0Hg', start: 52 }
    },
    summary: 'Sterowanie automatem, który podaje i składa elementy w gotowe żaluzje.',
    facts: [['PLC', 'sekwencje pracy'], ['HMI', 'obsługa operatora'], ['Serwo', 'napędy osi']],
    challenge: 'Automat łączy kilka mechanizmów podawania i składania, które muszą pracować w ścisłej sekwencji.',
    solution: 'Aplikacja PLC prowadzi sekwencje podawania i składania, serwonapędy realizują pozycjonowanie, a panel HMI łączy pracę automatu z obsługą operatora.',
    scope: ['Aplikacja PLC i HMI', 'Pozycjonowanie serwo', 'Sekwencje pracy', 'Parametry napędów w repozytorium'],
    tech: ['PLC', 'HMI', 'Serwonapędy', 'Falowniki'],
    control: {
      top: ['Panel HMI', 'Parametry zamówienia'],
      plc: 'PLC',
      bus: 'Sieć napędów',
      field: ['Serwonapęd podawania', 'Zespoły składania', 'Falowniki', 'Pneumatyka', 'Czujniki']
    }
  },
  {
    id: 'serwis-form',
    title: 'Urządzenie do czyszczenia kanałów chłodzenia form',
    category: 'Maszyny seryjne',
    sector: 'Producent urządzeń do serwisu form wtryskowych',
    media: {
      photo: 'assets/img/projects/serwis-form.jpg',
      alt: 'Mobilne urządzenie do czyszczenia kanałów chłodzenia form wtryskowych',
      video: { id: 'hWU-LDsQ984', start: 110 }
    },
    summary: 'Mobilne urządzenie, które czyści i diagnozuje kanały chłodzenia form wtryskowych — przeniesione na nową platformę sterowania.',
    facts: [['2', 'generacje sterowania'], ['PLC + HMI', 'aplikacja'], ['EtherCAT', 'konfiguracja I/O']],
    challenge: 'Urządzenie miało przejść na nowszą platformę sterowników przy zachowaniu funkcji czyszczenia i diagnostyki.',
    solution: 'Sekwencje czyszczenia, diagnostyka i obsługa operatorska zostały przeniesione na nowszy sterownik CODESYS. Konfiguracja I/O pracuje w sieci EtherCAT.',
    scope: ['Aplikacja PLC i HMI', 'Migracja na nową platformę', 'Sekwencje procesu', 'Diagnostyka'],
    tech: ['PLC CODESYS', 'EtherCAT', 'HMI', 'Diagnostyka'],
    control: {
      top: ['Panel HMI', 'Raport diagnostyki'],
      plc: 'PLC CODESYS',
      bus: 'EtherCAT',
      field: ['Obiegi czyszczenia', 'Zawory', 'Czujniki procesu', 'Moduły I/O']
    }
  },
  {
    id: 'nalewarka',
    title: 'Nalewarka kosmetyków w małych dawkach',
    category: 'Linie i instalacje',
    sector: 'Producent systemów etykietowania i pakowania',
    media: {
      photo: 'assets/img/projects/rozlewarka.jpg',
      alt: 'Głowica zakręcająca nad gniazdem z opakowaniem',
      video: { id: 'uNSu2W4lIJ0', start: 25 }
    },
    summary: 'Dozowanie produktu kosmetycznego z podgrzewaniem, recepturami i diagnostyką każdego czujnika w cyklu.',
    facts: [['2', 'osie serwo z enkoderem absolutnym'], ['32', 'bity diagnostyki czujników'], ['V1.2.4', 'wersja na maszynie']],
    challenge: 'Produkt musi być podgrzewany także na postoju, a każda dawka trafić dokładnie do opakowania ustawionego w gnieździe. Operator potrzebuje jasnej informacji, który czujnik zatrzymał cykl.',
    solution: 'Aplikacja CODESYS prowadzi centrowanie, dosuw opakowania, otwarcie zaworów zbiornika i nalewaka oraz grzanie postojowe. Dwie osie serwo z enkoderem absolutnym pilnują bazowania przed ruchem. Każdy czujnik ma bit w słowie błędów, a panel pokazuje jego opis. Parametry produktów zapisuje się jako receptury.',
    scope: ['Aplikacja PLC z recepturami', 'Osie serwo i bazowanie', 'Grzanie i kontrola ciśnienia', 'Diagnostyka czujników na HMI'],
    tech: ['PLC CODESYS', 'Serwonapędy', 'Receptury', 'HMI'],
    control: {
      top: ['Panel HMI', 'Receptury produktów', 'Lista alarmów'],
      plc: 'PLC CODESYS',
      bus: 'Sieć napędów i I/O',
      field: ['Oś serwo 1', 'Oś serwo 2', 'Zawory zbiornika i nalewaka', 'Grzałka', 'Centratory i popychacz', 'Czujniki poziomu i ciśnienia']
    }
  },
  {
    id: 'laczenie-drewna',
    title: 'Modernizacja linii do łączenia drewna na mikrowczep',
    category: 'Linie i instalacje',
    sector: 'Integrator modernizacji linii stolarskich',
    media: {
      photo: 'assets/img/projects/laczenie-drewna.jpg',
      alt: 'Linia do łączenia drewna na mikrowczep z prasą i przenośnikami',
      video: { id: 'VvQGllTZ9gY', start: 140 }
    },
    summary: 'Nowe sterowanie dla dwóch linii do łączenia drewna na długość: pchacze, krokowe podajniki, przenośniki i chwytak robota.',
    facts: [['2', 'linie'], ['7', 'serwonapędów na linii'], ['14', 'falowników przenośników']],
    challenge: 'Linie pracowały na starym sterowaniu. Nowy sterownik miał przejąć pchacze, podajniki krokowe, przenośniki i chwytak robota.',
    solution: 'Sterownik CODESYS steruje siedmioma serwonapędami: pchaczami, podajnikami krokowymi i ich pozycjonowaniem oraz chwytakiem robota. Przenośniki pracują na falownikach. Nastawy wszystkich napędów są w repozytorium parametrów, a zdalny serwis działa przez router.',
    scope: ['Retrofit sterowania', 'Pozycjonowanie serwo', 'Przenośniki na falownikach', 'Zdalny dostęp serwisowy'],
    tech: ['PLC CODESYS', 'Serwonapędy', 'Falowniki', 'Robot'],
    control: {
      top: ['Panel HMI', 'Router zdalnego serwisu'],
      plc: 'PLC CODESYS',
      bus: 'Sieć napędów i I/O',
      field: ['Pchacze (serwo)', 'Podajniki krokowe (serwo)', 'Pozycjonowanie (serwo)', 'Chwytak robota (serwo)', 'Przenośniki (falowniki)']
    }
  }
];

export const industries = [
  { icon: 'food', title: 'Spożywcza', text: 'Dozowanie, formowanie, pasteryzacja, rozlew i pakowanie.' },
  { icon: 'package', title: 'Opakowania i folie', text: 'Zgrzewarki, rolomaty, nawijacze, termoformierki.' },
  { icon: 'wood', title: 'Drewno i meble', text: 'Frezarki i wiertarki CNC, łączenie, zbijanie palet.' },
  { icon: 'stone', title: 'Kamień', text: 'Piły mostowe i maszyny do obróbki krawędzi.' },
  { icon: 'metal', title: 'Metal i profile', text: 'Gięcie blach i dziurkowanie profili.' },
  { icon: 'robot', title: 'Paletyzacja i robotyka', text: 'Linie paletyzacji i stanowiska z robotami.' },
  { icon: 'lab', title: 'Badania i laboratoria', text: 'Komory klimatyczne, stanowiska testowe, testery.' },
  { icon: 'water', title: 'Woda i energia', text: 'Pompownie, rozdzielnie, monitoring zużycia energii.' },
  { icon: 'stage', title: 'Scena i rozrywka', text: 'Sterowanie mechaniką sceny.' }
];

export const competences = [
  { image: 'assets/img/equipment/ax3.jpg', title: 'Sterowniki PLC', text: 'Platformy CODESYS i klasyczne PLC. Structured Text, Ladder, biblioteki funkcyjne, PLC wbudowane w falowniki.' },
  { image: 'assets/img/equipment/hmi.jpg', title: 'Panele HMI', text: 'Ekrany operatorskie 7–24″, receptury, alarmy, wielojęzyczność, zdalny podgląd.' },
  { image: 'assets/img/equipment/servo.jpg', title: 'Motion i serwonapędy', text: 'Pozycjonowanie, synchronizacja osi, krzywki elektroniczne, silniki krokowe.' },
  { image: 'assets/img/equipment/inverter.jpg', title: 'Falowniki', text: 'Przenośniki, pompy, wentylatory. Parametry każdego napędu przechowujemy w repozytorium projektu.' },
  { image: 'assets/img/equipment/scada.jpg', title: 'SCADA i dane', text: 'Trendy, raporty, historia w SQL Server i SQLite, eksport danych, aplikacje w Node-RED.' },
  { image: 'assets/img/equipment/temperature-controller.jpg', title: 'Regulacja procesu', text: 'Grzanie, chłodzenie, ciśnienie i przepływ. Regulacja PID i histereza.' }
];

export const protocols = [
  { src: 'assets/img/protocols/ethercat.png', name: 'EtherCAT' },
  { src: 'assets/img/protocols/ethernetip.jpg', name: 'EtherNet/IP' },
  { src: 'assets/img/protocols/modbus.png', name: 'Modbus TCP/RTU' },
  { src: 'assets/img/protocols/canopen.png', name: 'CANopen' },
  { src: 'assets/img/protocols/opcua.png', name: 'OPC UA' }
];

export const process = [
  { title: 'Analiza', text: 'Ustalamy z klientem funkcje maszyny, sekwencje, bezpieczeństwo i sposób obsługi.' },
  { title: 'Aplikacja PLC i HMI', text: 'Program sterownika i ekrany operatora powstają w jednym projekcie, od wspólnego szablonu działu.' },
  { title: 'Napędy i komunikacja', text: 'Konfigurujemy serwonapędy, falowniki, sieci przemysłowe i połączenia z robotami.' },
  { title: 'Uruchomienie', text: 'Testy na obiekcie, szkolenie operatorów i instrukcja obsługi dla klienta.' },
  { title: 'Serwis', text: 'Zdalny dostęp, rejestr zmian i wersji dla każdej maszyny, rozwój aplikacji po latach.' }
];

export const repoStandard = [
  { name: 'PLC', text: 'projekt sterownika (submoduł)' },
  { name: 'HMI', text: 'projekt panelu (submoduł)' },
  { name: 'PARAMETRY', text: 'nastawy serwonapędów i falowników' },
  { name: 'DOKUMENTACJA', text: 'instrukcje, ustalenia, schematy' },
  { name: 'CHANGELOG', text: 'historia zmian i wizyt serwisowych' },
  { name: 'Lista maszyn', text: 'wersja programu i wyposażenie każdego egzemplarza' }
];

export function filterProjects(category = 'Wszystkie') {
  return projects.filter(p => category === 'Wszystkie' || p.category === category);
}
