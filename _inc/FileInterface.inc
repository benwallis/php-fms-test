<?php
interface FileInterface
{
  /**
   * @return string
   */
  public function getName();

  /**
   * @param string $name
   *
   * @return $this
   */
  public function setName($name);

  /**
   * @return int
   */
  public function getSize();

  /**
   * @param int $size
   *
   * @return $this
   */
  public function setSize($size);

  /**
   * @return string
   */
  public function getPath();
}

class File implements FileInterface
{
    public $name;
    public $size;
    public $path;
    public $formatted_size;
    //public $type;
    //public $modified;

    private $folder = 'userfiles/';

    public function __construct($path)
    {
        clearstatcache();

        $this->path = $path;
        $this->setName(pathinfo($path, PATHINFO_BASENAME));
        $this->setSize(filesize($path));

        $this->formatted_size = filesize_format($this->size);

        // $this->type = get_file_mime_type($path);
        // $this->modified = filemtime($path);
    }

    /**
    * @return string
    *
    */
    public function getName()
    {
        return $this->name;
    }

    /**
    * @param string $name
    *
    * @return $this
    */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return int
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * @param int $size
     *
     * @return $this
     */
    public function setSize($size)
    {
        $this->size = $size;
    }

    /**
    * @return string
    *
    */
    public function getPath()
    {
        return $this->path;
    }
}
