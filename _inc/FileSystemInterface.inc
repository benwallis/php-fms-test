<?php

/**
 * File System Management
 */
interface FileSystemInterface
{
  /**
   * @param FileInterface   $file
   *
   * @return FileInterface
   */
  public function createFile(File $file);

  /**
   * @param FileInterface $file
   * @param               $newName
   *
   * @return FileInterface
   */
  public function renameFile(File $file, $newName);

  /**
   * @param FileInterface $file
   *
   * @return bool
   */
  public function deleteFile(File $file);

  /**
   * @param FileInterface $file
   *
   * @return int
   */
  public function getFileSize(File $file);

  /**
   *
   * @return int
   */
  public function getFileCount();

}

class FileSystem implements FileSystemInterface
{
    public $rootFolder;
    public $fileCount = 0;
    public $filesArray = array();
    public $error;

    public function __construct($folder='userfiles')
    {
        $this->rootFolder = $folder;
        $this->getFileCount();
    }

    /**
    * @param FileInterface   $file
    *
    * @return FileInterface
    */
    public function createFile(File $file)
    {
        $pattern = '/^[a-z0-9\.\-\_]+$/i';

    }


    /**
    * @param FileInterface $file
    * @param               $newName
    *
    * @return FileInterface
    */
    public function renameFile(File $file, $newName)
    {

        // $file->setName($newName);
    }

    /**
    * @param FileInterface $file
    *
    * @return bool
    */
    public function deleteFile(File $file)
    {
        if (is_file($file->getPath())) return (unlink($file->getPath()));

        return false;
    }

    /**
    * @param FileInterface $file
    *
    * @return int
    */
    public function getFileSize(File $file)
    {
         return $file->getSize();
    }

    /**
    *
    * @return int
    */
    public function getFileCount()
    {
        $files = array_diff(scandir($this->rootFolder), array('..', '.'));

        foreach ($files as $f)
        {
            $new_file = new \File($this->rootFolder.'/'.$f);

            array_push($this->filesArray, $new_file);
        }

        $this->fileCount = sizeof($files);

        return $this->fileCount;
    }
}