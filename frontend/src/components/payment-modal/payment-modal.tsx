import { observer } from "@legendapp/state/react";
import { Modal, Title, Group, Text, Stack } from "@mantine/core";
import { globalState$ } from "../../state/global-state";
import { CurrencyPaymentCard } from "./currency-payment-card/currency-payment-card";
import { Observable } from "@legendapp/state";
export const PaymentModal = observer(
  ({
    opened,
    close,
    text$,
  }: {
    opened: boolean;
    close: () => void;
    text$: Observable<string>;
  }) => {
    return (
      <Modal
        opened={opened}
        onClose={close}
        size="lg"
        padding="lg"
        withCloseButton={false}
        centered
      >
        <Stack>
          <Title order={2}>Payment</Title>
          <Text>
            If you spend more, your submission slice will be larger on the
            wheel. Submitting an entry does not guarantee that it will be added
            to the wheel. The creator will review your submission and may choose
            to remove/deny.
          </Text>
          <Group grow align="baseline" gap="md">
            {globalState$.currencyInfo.map((currency$) => (
              <CurrencyPaymentCard
                currency$={currency$}
                submissionText$={text$}
              />
            ))}
          </Group>
        </Stack>
      </Modal>
    );
  }
);
