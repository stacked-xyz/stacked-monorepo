


export function BalanceList{
  const balances = getBalances(ownerAddress, assets);


  return (
    <div className="space-y-8">
      {balances.map(({ symbol, asset, balance }) => (
        <div key={symbol} className="flex items-center">
          {/* TODO: Add Logos */}
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{symbol}</p>
            <p className="text-sm text-muted-foreground">{asset}</p>
          </div>
          <div className="ml-auto font-medium">{balance}</div>
        </div>
      ))}
    </div>
  );
}
