import { Console } from "@woowacourse/mission-utils";
import CostManager from "./CostManager.js";
import LottoGenerator from "./LottoGenerator.js";
import GetNumber from "./GetNumber.js";

class App {
  async run() {
    const costManager = new CostManager();
    const lottoGenerator = new LottoGenerator();
    const getNumber = new GetNumber();

    await this.handlePurchaseLottos(costManager, lottoGenerator);

    await this.handleGetWinNumber(getNumber);

    await this.handleGetBonusNumber(getNumber);
  }

  async handlePurchaseLottos(costManager, lottoGenerator) {
    try {
      await this.purchaseLottos(costManager, lottoGenerator);
    } catch (error) {
      console.error(error.message);
      await this.handlePurchaseLottos(costManager, lottoGenerator);
    }
  }

  async handleGetWinNumber(getNumber) {
    try {
      await getNumber.getWinNumber();
    } catch (error) {
      console.error(error.message);
      await this.handleGetWinNumber(getNumber);
    }
  }

  async handleGetBonusNumber(getNumber) {
    try {
      await getNumber.getBonusNumber();
    } catch (error) {
      console.error(error.message);
      await this.handleGetBonusNumber(getNumber);
    }
  }

  async purchaseLottos(costManager, lottoGenerator) {
    const lottoCount = await costManager.getLottoCountFromCost();
    Console.print(`${lottoCount}개를 구매했습니다.`);
    lottoGenerator.generateLottos(lottoCount);
  }
}

export default App;
