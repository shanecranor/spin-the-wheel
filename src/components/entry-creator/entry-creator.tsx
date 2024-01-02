import { Button, TextInput } from "@mantine/core";
import styles from "./entry-creator.module.scss";
import { observer, useObservable } from "@legendapp/state/react";
const EntryCreator = observer(
  ({ createEntry }: { createEntry: (text: string) => void }) => {
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
        <Button onClick={() => createEntry(entryText$.peek())}>
          Add to wheel
        </Button>
      </div>
    );
  }
);

export default EntryCreator;
