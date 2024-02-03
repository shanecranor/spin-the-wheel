import { Observable } from "@legendapp/state";
import { observer, useObservable } from "@legendapp/state/react";
import {
  Card,
  Title,
  Slider,
  Text,
  NumberInput,
  Stack,
  Button,
} from "@mantine/core";
import { CurrencyInfo } from "@shared/types";
import styles from "./currency-payment-card.module.scss";
export const CurrencyPaymentCard = observer(
  ({
    currency$,
    submissionText$,
  }: {
    currency$: Observable<CurrencyInfo>;
    submissionText$: Observable<string>;
  }) => {
    console.log(submissionText$.get());
    const amount$ = useObservable(currency$.minPrice.get());
    if (amount$.get() < 0) {
      amount$.set(currency$.minPrice.get());
    }
    if (currency$.minPrice.get() < 0) {
      return <></>;
    }
    return (
      <Card withBorder>
        <Stack>
          <Title order={2} className={styles.caps}>
            {currency$.name.get()}
          </Title>
          <AmmountInput currency$={currency$} amount$={amount$} />
          <Text>
            {amount$.get()} {currency$.name.get()}
          </Text>
          <Button>Pay with {currency$.name.get()} </Button>
        </Stack>
      </Card>
    );
  }
);

const AmmountInput = observer(
  ({
    currency$,
    amount$,
  }: {
    currency$: Observable<CurrencyInfo>;
    amount$: Observable<number>;
  }) => {
    const maxPrice = currency$.maxPrice.get();
    const minPrice = currency$.minPrice.get();
    if (maxPrice === "") {
      return <NumberInput min={minPrice} />;
    }
    return (
      <Slider
        defaultValue={minPrice}
        min={minPrice}
        max={maxPrice}
        step={1}
        value={amount$.get()}
        onChange={(value) => amount$.set(value)}
      />
    );
  }
);
