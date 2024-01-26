import { Flex, Title } from "@mantine/core";

export const FullPageInfoMessage = ({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) => {
  return (
    <main>
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ height: "100vh" }}
        p="xl"
      >
        <Title>{message}</Title>
        {children}
      </Flex>
    </main>
  );
};
