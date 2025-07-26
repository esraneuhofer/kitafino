export function isTragerNachbestellung(
    pastOrder: boolean,
    pastZubestellung: boolean,
    hasAdditionDaily: boolean,
    hasAdditionWeekly: boolean,
    contractStarted: boolean,
    tenantId: string
): boolean {
    const isPastOrderDeadline = pastOrder;
    const canStillAddOrder = !pastZubestellung;
    const hasAdditionSettings = hasAdditionDaily || hasAdditionWeekly;
    const isContractActive = contractStarted;
    const isSpecificTenant = tenantId === '651c635eca2c3d25809ce4f5' || tenantId === '5a03657bf36d28193a5dc387';


    return isPastOrderDeadline && canStillAddOrder && hasAdditionSettings && isContractActive && isSpecificTenant;
}