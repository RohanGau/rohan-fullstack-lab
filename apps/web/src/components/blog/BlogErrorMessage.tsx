import { BackToBlogButton } from './BackToBlogButton';

export const BlogErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4">{message}</p>
      <BackToBlogButton />
    </div>
  );
};
