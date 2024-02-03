import { Observable } from "@legendapp/state";
import { Card, Stack, Checkbox, Group, NumberInput } from "@mantine/core";
import { CurrencyInfo } from "@shared/types";
import styles from "../settings-modal.module.scss";
import { observer } from "@legendapp/state/react";

export const CurrencyCard = observer(
  ({ currency$ }: { currency$: Observable<CurrencyInfo> }) => {
    const minPrice = currency$.minPrice.get();
    const maxPrice = currency$.maxPrice.get();
    const cooldownMinutes = currency$.cooldownMinutes.get();
    let error = "";
    if (maxPrice !== "" && minPrice > maxPrice) {
      error = "max > min";
    }
    return (
      <Card
        withBorder
        p="lg"
        className={`${styles["currency-settings"]} ${
          currency$.minPrice.get() < 0 ? "" : styles.selected
        }`}
      >
        <Stack gap="md">
          <Checkbox
            size="md"
            label={`${
              currency$.minPrice.get() < 0 ? "Enable" : "Disable"
            } ${currency$.name.get()}`}
            variant="filled"
            checked={currency$.minPrice.get() >= 0}
            onChange={(event) => {
              currency$.minPrice.set(event.currentTarget.checked ? 0 : -1);
            }}
          />
          {currency$.minPrice.get() >= 0 && (
            <>
              <Group>
                <NumberInput
                  label="Minimum price"
                  description="The smallest entry fee"
                  placeholder="Free entry"
                  value={minPrice || ""}
                  suffix={" " + currency$.name.get()}
                  allowDecimal={false}
                  hideControls
                  onChange={(value) => {
                    currency$.minPrice.set(Number(value));
                  }}
                />
                <NumberInput
                  label="Maximum price"
                  description="Cap the max spend"
                  placeholder="No limit"
                  error={error}
                  value={maxPrice}
                  suffix={" " + currency$.name.get()}
                  allowDecimal={false}
                  hideControls
                  onChange={(value) => {
                    if (value === "") {
                      currency$.maxPrice.set(value);
                    } else {
                      currency$.maxPrice.set(Number(value));
                    }
                  }}
                />
              </Group>
              <NumberInput
                label="Cooldown"
                description="How long do users have to wait before submitting another entry?"
                placeholder="No cooldown"
                suffix=" minutes"
                value={cooldownMinutes}
                onChange={(value) => {
                  currency$.cooldownMinutes.set(Number(value));
                }}
              />
            </>
          )}
        </Stack>
      </Card>
    );
  }
);
