import { Button, TextInput } from "@mantine/core";
import styles from "./entry-creator.module.scss";
import { observer, useObservable } from "@legendapp/state/react";
import { EntryFunction } from "../../state/commands";
const EntryCreator = observer(
  ({ createEntry }: { createEntry: EntryFunction }) => {
    const entryText$ = useObservable("");
    return (
      <div className={styles["c-entry-creator"]}>
        <TextInput
          mb="sm"
          label="Create a wheel item"
          description="add your own item to the wheel"
          placeholder="end stream"
          value={entryText$.get()}
          onChange={(e) => entryText$.set(e.currentTarget.value)}
        />
        <Button
          onClick={() =>
            createEntry({
              id: crypto.randomUUID(),
              text: entryText$.peek(),
              author: "you",
              isSafe: true,
              isOnWheel: true,
            })
          }
        >
          Add to wheel
        </Button>
      </div>
    );
  }
);

export default EntryCreator;
