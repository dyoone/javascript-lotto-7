import { Console } from '@woowacourse/mission-utils';

class CostManager {
    async getLottoCountFromCost() {
        const cost = await this.readCost();
        return this.validateCost(cost);
    }

    async readCost() {
        const input = await Console.readLineAsync('구매금액을 입력해주세요.');
        return Number(input);
    }

    validateCost(cost) {
        if (Number(cost) % 1000 !== 0) {
            throw new Error('[Error] 천원단위로만 입력할 수 있습니다.');
        }
        return cost / 1000;
    }
}

export default CostManager;