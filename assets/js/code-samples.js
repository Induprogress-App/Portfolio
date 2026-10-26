// Uproszczone przykłady kodu w stylu naszych projektów. Napisane od nowa na potrzeby strony,
// bez kodu klientów. Kod JavaScript pobieramy z prawdziwego pliku, który działa w demo obok.

export const codeSamples = [
  {
    id: 'st-sensor',
    label: 'PLC · diagnostyka czujnika',
    lang: 'Structured Text',
    note: 'Każdy czujnik w cyklu ma swój bit w słowie błędów. Panel HMI pokazuje opis bitu, więc operator od razu wie, co zatrzymało maszynę.',
    code: `FUNCTION_BLOCK FB_SensorWatch
VAR_INPUT
    xExpected : BOOL;      // krok sekwencji czeka na czujnik
    xSensor   : BOOL;      // stan czujnika
    tTimeout  : TIME := T#3S;
    iBit      : INT;       // numer bitu w słowie błędów
END_VAR
VAR_IN_OUT
    dwErrorID : DWORD;     // słowo błędów wyświetlane na HMI
END_VAR
VAR_OUTPUT
    xDone     : BOOL;
    xError    : BOOL;
END_VAR
VAR
    tonWait   : TON;
END_VAR

tonWait(IN := xExpected AND NOT xSensor, PT := tTimeout);
xDone  := xExpected AND xSensor;
xError := tonWait.Q;

IF xError THEN
    dwErrorID := dwErrorID OR SHL(DWORD#1, iBit);
END_IF
END_FUNCTION_BLOCK`
  },
  {
    id: 'st-sequence',
    label: 'PLC · sekwencja cyklu',
    lang: 'Structured Text',
    note: 'Sekwencja jako maszyna stanów. Każdy krok ma jedno zadanie, a przejście tylko przez potwierdzenie czujnika lub osi. Błąd przenosi cykl do stanu bezpiecznego.',
    code: `TYPE E_Step : (IDLE, CENTER, PUSH_IN, DOSE, PUSH_OUT, DONE, FAULT); END_TYPE

CASE eStep OF
    E_Step.IDLE:
        IF xStart AND xAxesHomed AND xPressureOk THEN
            eStep := E_Step.CENTER;
        END_IF

    E_Step.CENTER:
        qCentering := TRUE;
        fbCenter(xExpected := TRUE, xSensor := iCentered, iBit := 11, dwErrorID := dwErrorID);
        IF fbCenter.xDone THEN eStep := E_Step.PUSH_IN; END_IF

    E_Step.PUSH_IN:
        qPusher := TRUE;
        fbPusher(xExpected := TRUE, xSensor := iPusherOn, iBit := 4, dwErrorID := dwErrorID);
        IF fbPusher.xDone THEN eStep := E_Step.DOSE; END_IF

    E_Step.DOSE:
        fbDose(xExecute := TRUE, rVolume := stRecipe.rDoseMl);
        IF fbDose.xDone THEN eStep := E_Step.PUSH_OUT; END_IF

    E_Step.PUSH_OUT:
        qPusher := FALSE;
        qCentering := FALSE;
        IF iPusherOff THEN eStep := E_Step.DONE; END_IF

    E_Step.DONE:
        udiCount := udiCount + 1;
        eStep := E_Step.IDLE;
END_CASE

IF dwErrorID <> 0 THEN
    eStep := E_Step.FAULT;   // zawory zamknięte, napędy zatrzymane
END_IF`
  },
  {
    id: 'node-fefco',
    label: 'Node.js · kalkulator formatek',
    lang: 'JavaScript (ES modules)',
    note: 'Ten moduł liczy formatkę FEFCO 201 i rysuje rozkrój. Ten sam plik działa w demo obok i w testach jednostkowych w Node.js.',
    src: 'assets/js/fefco.js'
  }
];
