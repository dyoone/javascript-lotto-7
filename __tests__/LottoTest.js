import CostManager from '../src/CostManager.js';
import { Console,Random } from '@woowacourse/mission-utils';
import LottoGenerator from '../src/LottoGenerator.js';
import GetNumber from '../src/GetNumber.js';
import CheckNumber from '../src/CheckNumber.js';
import WinningPrizeTable from '../src/WinningPrizeTable.js';
import PrintResult from '../src/PrintResult.js';

jest.mock('@woowacourse/mission-utils', () => ({
  Console: {
    readLineAsync: jest.fn(), // readLineAsync를 모킹
    print: jest.fn(),
  },
  Random: {
    pickUniqueNumbersInRange: jest.fn(),
  },
}));


describe("코스트 메니저 클래스 테스트", () => {
  let costManager;

  beforeEach(() => {
    costManager = new CostManager(); // 각 테스트 전에 새로운 인스턴스를 생성 
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks(); // 모든 모킹을 초기화
  });


  test("입력값이 1000의 배수일 때.", async () => {
    Console.readLineAsync.mockResolvedValue('1000'); 

    const cost = await costManager.getLottoCountFromCost(); // 비동기 호출로 await 사용
    expect(cost).toBe(1); // 실제로 숫자형으로 비교
  });


  test("입력값이 1000의 배수가 아닐 때", async () => {
    Console.readLineAsync.mockResolvedValue('1500')
    await expect(costManager.getLottoCountFromCost()).rejects.toThrow('[Error] 천원단위로만 입력할 수 있습니다.');
  });

  test('generateLottos는 lottoCount만큼의 정렬된 로또 번호를 출력한다.', () => {
    const checkNumber = new CheckNumber(); // CheckNumber 인스턴스 생성
    let lottoGenerator = new LottoGenerator(checkNumber); // 인스턴스 전달
    const lottoCount = 2;

    Random.pickUniqueNumbersInRange
      .mockReturnValueOnce([5, 3, 12, 45, 20, 8])
      .mockReturnValueOnce([7, 15, 2, 30, 41, 22]);

    lottoGenerator.generateLottos(lottoCount);

    expect(Console.print).toHaveBeenCalledTimes(lottoCount);
    expect(Console.print).toHaveBeenNthCalledWith(1, [3, 5, 8, 12, 20, 45]);
    expect(Console.print).toHaveBeenNthCalledWith(2, [2, 7, 15, 22, 30, 41]);
  });
  
});


describe('Get Number 테스트', ()=>{
  let getNumber;
  beforeEach(() => {
    getNumber = new GetNumber();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('중복된 번호 없을 때', async () => {
    const getNumber = new GetNumber();
    const mockValues = ['1,2,3,4,5,6', '7'];

    // 모의 입력 설정
    Console.readLineAsync.mockResolvedValueOnce(mockValues[0]);
    await getNumber.getWinNumber();

    Console.readLineAsync.mockResolvedValueOnce(mockValues[1]);
    await getNumber.getBonusNumber();

    // 기대 결과 검증
    expect(getNumber.winNumber).toEqual([1, 2, 3, 4, 5, 6]);
    expect(getNumber.bonusNumber).toEqual([7]);
});

  test('당첨 번호에 중복된 번호 있을 때', async ()=>{
    const mockValues = ['1,2,3,4,5,6', '7']; 
   
    Console.readLineAsync.mockResolvedValue('1,2,3,4,5,1');
    await expect(getNumber.getWinNumber()).rejects.toThrow('[ERROR]중복되는 번호 혹은 공백이 있습니다.');
  })

  test('보너스 번호에 중복된 번호 있을 때', async()=>{
    Console.readLineAsync.mockResolvedValue('1,2,3,4,5,6')
    await getNumber.getWinNumber();

    Console.readLineAsync.mockResolvedValue('6')
    await expect(getNumber.getBonusNumber()).rejects.toThrow('[Error] 당첨 번호와 보너스 번호가 중복되면 안 됩니다.')
  })
  
  test('1~45에 해당하지 않는 번호가 있을 때', async ()=>{
    Console.readLineAsync.mockResolvedValue('1,2,3,4,55,6');
    await expect(getNumber.getWinNumber()).rejects.toThrow('[Error] 1~45까지만 허용 됩니다.');
  })

  

})


describe('CheckNumber 테스트', () => {
  let checkNumber;
  let mockGetNumber;

  beforeEach(() => {
    mockGetNumber = {
      winNumber: [1, 15, 21, 11, 10, 20],
      bonusNumber: [6]
    };
    checkNumber = new CheckNumber(mockGetNumber);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('매칭 테스트', () => {
    checkNumber.RandomLottoNumbers = [
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10, 11, 12]
    ];

    checkNumber.checkNumbers();

    expect(checkNumber.matchingResult).toEqual([[2, true], [2, false]]);
  });
});

describe('WinningPrizeTable 테스트', () => {
  let winningPrizeTable;
  let mockCheckNumber;

  beforeEach(() => {
      mockCheckNumber = {
          checkNumbers: jest.fn(),  
          matchingResult: [          
              [3, false],
              [4, false],
              [5, false],
              [5, true],
              [6, false]
          ]
      };

      winningPrizeTable = new WinningPrizeTable(mockCheckNumber);
  });

  test('당첨 내역 업데이트 확인', () => {
      winningPrizeTable.updateWinningPrizeTable();

      expect(mockCheckNumber.checkNumbers).toHaveBeenCalled();

      expect(winningPrizeTable.winningPrizeTable['3개 일치 (5,000원)']).toBe(1);
      expect(winningPrizeTable.winningPrizeTable['4개 일치 (50,000원)']).toBe(1);
      expect(winningPrizeTable.winningPrizeTable['5개 일치 (1,500,000원)']).toBe(1);
      expect(winningPrizeTable.winningPrizeTable['5개 일치, 보너스 볼 포함 (30,000,000원)']).toBe(1);
      expect(winningPrizeTable.winningPrizeTable['6개 일치 (2,000,000,000원)']).toBe(1);
  });
});

describe('PrintResult', () => {
  let printResult;
  let winningPrizeTableMock;

  beforeEach(() => {
      winningPrizeTableMock = {
          winningPrizeTable: {
              '3개 일치 (5,000원)': 1,
              '4개 일치 (50,000원)': 0,
              '5개 일치 (1,500,000원)': 2,
              '5개 일치, 보너스 볼 포함 (30,000,000원)': 0,
              '6개 일치 (2,000,000,000원)': 1,
          }
      };

      printResult = new PrintResult(winningPrizeTableMock);
  });

  it('당첨 통계 올바르게 출력', () => {
      const consoleSpy = jest.spyOn(Console, 'print').mockImplementation();

      printResult.printingResult();

      expect(consoleSpy).toHaveBeenCalledTimes(6);
      expect(consoleSpy).toHaveBeenCalledWith('\n당첨 통계\n---');
      expect(consoleSpy).toHaveBeenCalledWith('3개 일치 (5,000원) - 1개');
      expect(consoleSpy).toHaveBeenCalledWith('4개 일치 (50,000원) - 0개');
      expect(consoleSpy).toHaveBeenCalledWith('5개 일치 (1,500,000원) - 2개');
      expect(consoleSpy).toHaveBeenCalledWith('5개 일치, 보너스 볼 포함 (30,000,000원) - 0개');
      expect(consoleSpy).toHaveBeenCalledWith('6개 일치 (2,000,000,000원) - 1개');

      consoleSpy.mockRestore();
  });
});

/*describe("로또 클래스 테스트", () => {
  test("로또 번호의 개수가 6개가 넘어가면 예외가 발생한다.", () => {
    expect(() => {
      new Lotto([1, 2, 3, 4, 5, 6, 7]);
    }).toThrow("[ERROR]");
  });

  // TODO: 테스트가 통과하도록 프로덕션 코드 구현
  test("로또 번호에 중복된 숫자가 있으면 예외가 발생한다.", () => {
    expect(() => {
      new Lotto([1, 2, 3, 4, 5, 5]);
    }).toThrow("[ERROR]");
  });

  // TODO: 추가 기능 구현에 따른 테스트 코드 작성
});*/
